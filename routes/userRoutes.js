const express = require(`express`);
const router = express.Router();
const userControllers = require(`../controllers/user`)
const { check } = require(`express-validator`)
const isAuth = require(`../utility/auth`)

router.get(`/`, isAuth, userControllers.getToHome)

router.get(`/login`, userControllers.getToLogin)

router.post(`/login`, check(`phone`, "لطفا شماره را بدرستی وارد کنید").isNumeric(), userControllers.postToLogin)

router.post(`/uploadImage`, userControllers.postUploadImage)

router.post(`/answereImage`, userControllers.postToAnswereImage)

router.post(`/commandAnswer`, userControllers.postCommandAnswer)

router.get(`/invite/:inviteCode`, userControllers.getInvite)

module.exports = router