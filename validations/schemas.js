const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(16)
    .pattern(/^[A-Za-z]+$/)
    .message('Username must contain only letters (A-Z, a-z) and be between 3 and 16 characters long.')
    .required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/^[\w.+-]+@[\w-]+\.[\w.-]+$/)
    .message('Email format is invalid.')
    .required(),
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/)
    .message('Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.')
    .required()
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  password: Joi.string().min(6).required() 
});

const postSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required()
});

const commentSchema = Joi.object({
  text: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  postSchema,
  commentSchema
};
