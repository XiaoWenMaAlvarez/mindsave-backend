import type { NextFunction, Request, Response } from "express";
import { CustomError, UserEntity, type UserRepository, ResetPasswordUseCase } from "../../domain/init.js";
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

  registerUser = (req: Request, res: Response, next: NextFunction) => {
    const [error, userEntity] = UserDTO.register(req.body);
    if(error) return res.status(400).json({error});
    
    new RegisterUser(this.userRepository, this.emailService, this.verifyEmailUrl)
      .execute(userEntity!)
      .then((data: UserEntity) => res.status(201).json(data.toJson()))
      .catch(next);
  }

  validateEmail = (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    if(typeof token !== 'string' || token.trim() === "") return res.status(400).send(emailValidatePageError());
    new ValidateEmail(this.userRepository)
      .execute(token)
      .then(() => res.status(200).send(emailValidatePage()))
      .catch(() => res.status(400).send(emailValidatePageError()));
  }

  resetPassword = (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const tokenTimeAliveMinutes = 15;
    if(typeof email !== 'string' || isValidEmail(email) !== true) return res.status(400).json({error: "Invalid email"});
    
    new ResetPasswordUseCase(this.userRepository, this.emailService, this.resetPasswordUrl)
      .sendResetPasswordEmail(email, tokenTimeAliveMinutes)
      .then(() => res.json({message: "OK"}))
      .catch(next);
  }

  resetPasswordWithTokenPage = (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    if(typeof token !== 'string' || token.trim() === "") return res.status(400).send(resetPasswordErrorPage());
    
    new ResetPasswordUseCase(this.userRepository, this.emailService, this.resetPasswordUrl)
      .validateResetPasswordToken(token)
      .then((result: boolean) => {
        if(result) return res.status(200).send(resetPasswordPage(token));
        return res.status(400).send(resetPasswordErrorPage());
      }).catch(() => res.status(400).send(resetPasswordErrorPage()));
  }

  resetPasswordWithToken = (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    if(typeof token !== 'string' || token.trim() === "") return res.status(400).json({error: "Invalid token"});

    const [error, resetPasswordDto] = UserDTO.resetPassword(req.body);
    if(error) return res.status(400).json({error});

    new ResetPasswordUseCase(this.userRepository, this.emailService, this.resetPasswordUrl)
      .setNewPassword(token, resetPasswordDto!.password)
      .then((result: boolean) => {
        if(result) return res.status(200).send(resetPasswordSuccessPage());
        return res.status(400).send(resetPasswordFailedPage());
      }).catch(next);
  }

  loginUser = (req: Request, res: Response, next: NextFunction) => {
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
          const token = JwtAdapter.generateToken(
            {id: user.id, email: user.email, name: user.name, role: user.role},
            "session",
          );
          if(!token) throw CustomError.internalServerError("Error generating token");
          return res.status(200).json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            token
          });
        }
      })
      .catch(next);
  }

  checkStatus = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, email, name, role } = req.user!;
      const token = JwtAdapter.generateToken({ id, email, name, role }, "session");
      if(!token) throw CustomError.internalServerError("Error generating token");
      return res.status(200).json({
        id,
        email,
        name,
        role,
        token
      });
    } catch (error) {
      next(error);
    }
  }

}
