import type { Request, Response } from "express";
import { CustomError, UserEntity, type UserRepository, ResetPasswordUseCase } from "../../domain/init.js";
import { Logger } from "../../plugins/init.js";
import { UserDTO } from "../validators/dtos/auth/user.dto.js";
import { JwtAdapter } from "../../config/jwt.adapter.js";
import { EmailService } from "../../config/nodemailer.adapter.js";
import { RegisterUser } from "../../domain/use-cases/auth/register-user.use-case.js";
import { ValidateEmail } from "../../domain/use-cases/auth/validate-email.use-case.js";
import { isValidEmail } from "../validators/ini.js";
import {resetPasswordErrorPage, resetPasswordFailedPage, resetPasswordPage, resetPasswordSuccessPage, emailValidatePage, emailValidatePageError} from "./views/pages.js";

export class AuthController {

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly verifyEmailUrl: string,
    private readonly resetPasswordUrl: string,
  ){}

  private handleError = (error: any, res: Response) => {
    if(error instanceof CustomError){
      res.status(error.statusCode).json({error: error.message});
      return;
    }
    Logger.error(`ERROR: ${error}`);
    console.log(res);
    res.status(500).json({error: "Internal server error"});
  }

  registerUser = (req: Request, res: Response) => {
    const [error, userEntity] = UserDTO.register(req.body);
    if(error) return res.status(400).json({error});
    
    new RegisterUser(this.userRepository, this.emailService, this.verifyEmailUrl)
      .execute(userEntity!)
      .then((data: UserEntity) => res.status(201).json(data.toJson()))
      .catch((error) => this.handleError(error, res));
  }

  validateEmail = (req: Request, res: Response) => {
    const { token } = req.params;
    if(typeof token !== 'string') return res.status(400).json({error: "Invalid token"});
    new ValidateEmail(this.userRepository)
      .execute(token)
      .then(() => res.send(emailValidatePage()))
      .catch(error => res.send(emailValidatePageError()));
  }

  
  resetPassword = (req: Request, res: Response) => {
    const { email } = req.body;
    const tokenTimeAliveMinutes = 15;
    if(typeof email !== 'string' || !isValidEmail(email)) return res.status(400).json({error: "Invalid email"});
    new ResetPasswordUseCase(this.userRepository, this.emailService, this.resetPasswordUrl)
      .sendResetPasswordEmail(email, tokenTimeAliveMinutes);
    return res.json({message: "OK"});
  }

  resetPasswordWithTokenPage = (req: Request, res: Response) => {
    const { token } = req.params;
    if(typeof token !== 'string' || token.trim() === "") return res.status(400).json({error: "Invalid token"});
    
    new ResetPasswordUseCase(this.userRepository, this.emailService, this.resetPasswordUrl)
      .validateResetPasswordToken(token)
      .then((result: boolean) => {
        if(result) return res.send(resetPasswordPage(token));
        return res.send(resetPasswordErrorPage());
      }).catch(error => this.handleError(error, res));
  }

  resetPasswordWithToken = (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;
    if(typeof token !== 'string') return res.status(400).json({error: "Invalid token"});
    new ResetPasswordUseCase(this.userRepository, this.emailService, this.resetPasswordUrl)
      .setNewPassword(token, password)
      .then((result: boolean) => {
        if(result) return res.send(resetPasswordSuccessPage());
        return res.send(resetPasswordFailedPage());
      }).catch(error => this.handleError(error, res));
  }

  loginUser = (req: Request, res: Response) => {
    const [error, userLogin] = UserDTO.login(req.body);
    if(error) return res.status(400).json({error});
    this.userRepository.login(userLogin!.email, userLogin!.password)
      .then((result: UserEntity | string) => {
        if(typeof result === 'string') {
          if(result === "EMAIL_NOT_VERIFIED") return res.status(401).json({error: result})
          return res.status(400).json({error: result})
        };
        if(result instanceof UserEntity) {
          const {password, ...user} = result.toJson();
          const token = JwtAdapter.generateToken({id: user.id, email: user.email, name: user.name});
          if(!token) throw CustomError.internalServerError("Error generating token");
          return res.status(200).json({
            id: user.id,
            email: user.email,
            name: user.name,
            token
          });
        }
      })
      .catch(error => this.handleError(error, res));
  }

  checkStatus = (req: Request, res: Response) => {
    try {
      const { id, email, name } = req.body.payload;
      const token = JwtAdapter.generateToken({ id, email, name });
      if(!token) throw CustomError.internalServerError("Error generating token");
      return res.status(200).json({
        id,
        email,
        name,
        token
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

}