import { Resend } from 'resend';
import OtpSessionModel from '../Models/OtpSession.js'

const resend = new Resend('re_7dVex2Cv_5dTejLtUrg3zKUQ1FQxavcm7');

export const VarificationEmail = async (userEmail)=>{
    const userOtp = (1000 + Math.random() * 9000).toFixed(0);
    const result = await resend.emails.send({
        from: 'Store-X <otp@brawlingcoder.shop>',
        to: [userEmail],
        subject: 'sending from domain',
        html: `<h1>hello world and ur otp is ${userOtp}</h1>`,
      })
      if(result.error)  return  false
      //TODO: implement redis
       const otpDoc =await OtpSessionModel.create({otp:userOtp, userEmail})
       return otpDoc?._id
}