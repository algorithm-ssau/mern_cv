const Router = require("express");
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const config = require("config")
const {check, validationResult} = require("express-validator")
const router = new Router()
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware/auth.middleware')
const fileService = require('../services/fileService')
const File = require('../models/File')

router.post('/registration',
	[
		check('email', "Uncorrect email").isEmail(),
		check('password', 'Password must be longer than 3 and shorter than 12').isLength({min: 3, max: 12})
	],
	async (req, res) => {
		try {
			console.log(req.body)
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				return res.status(400).json({message: "Uncorrect request", errors})
			}

			const {email, password, name, surname} = req.body;
			const candidate = await User.findOne({email})

			if (candidate) {
				return res.status(400).json({message: `User with email ${email} already exists`})
			}
			const hashPassword = await bcrypt.hash(password, 15)
			const user = new User({email, password: hashPassword, name, surname})
			await user.save()
			await fileService.createDir(new File({user:user.id, name: ''}))

			return res.json({message: "User was created"})
		} catch (e) {
			console.log(e)
			res.send({message: "Server error"})
		}
	})

router.post('/login', async (req, res) => {
	try {
		const {email,password} = req.body
		const user = await User.findOne({email})

		if(!user){
			return res.status('404').json({message:'User not found.'})
		}

		const isPasswordRight = bcrypt.compareSync(password,user.password)
		if(!isPasswordRight){
			return res.status('400').json({message:'Password is wrong.'})
		}

		const token = jwt.sign({id:user.id},config.get('secretKey'),{expiresIn:'1h'})
		return res.json(
			{
				token,
				user:{
					id: user.id,
					email: user.email,
					name: user.name,
					surname: user.surname,
					diskSpace: user.diskSpace,
					usedSpace: user.usedSpace,
					avatar: user.avatar
				}
			}
		)
	} catch (e) {
		console.log(e)
		res.send({message: "Server error"})
	}
})

router.get('/auth', authMiddleware,
	async (req, res) => {
	try {
		const user = await User.findOne({id:req.user.id})
		const token = jwt.sign({id:user.id},config.get('secretKey'),{expiresIn:'1h'})
		return res.json(
			{
				token,
				user:{
					id: user.id,
					email: user.email,
					name:user.name,
					surname:user.surname,
					diskSpace: user.diskSpace,
					usedSpace: user.usedSpace,
					avatar: user.avatar
				}
			}
		)
	} catch (e) {
		console.log(e)
		res.send({message: "Server error"})
	}
})

module.exports = router