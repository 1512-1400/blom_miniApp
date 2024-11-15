const sequelize = require('sequelize');
const fs = require('fs');
const axios = require(`axios`)
const FormData = require(`form-data`)
const Message = require('../models/message');
const { validationResult } = require(`express-validator/`)
const User = require(`../models/user`);
const Messages_log = require(`../models/message_logs`);
const Reminder = require(`../models/reminder`)
const Dr_blom = require(`../models/dr_blom`)

exports.getToHome = (req, res, next) => {
    res.render(`user/home`, { title: `بلوم | دستیار مراقبت` })
}

exports.postUploadImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/${req.file.filename}`;
    res.json({
        src: imageUrl
    })
};

function findSpeciesInfo(results) {
    let firstCommonName = null;
    let firstScientificNameWithoutAuthor = null;

    for (const result of results) {
        if (firstCommonName === null && result.species.commonNames && result.species.commonNames.length > 0) {
            firstCommonName = result.species.commonNames[0];
        }

        if (firstScientificNameWithoutAuthor === null && result.species.scientificNameWithoutAuthor) {
            firstScientificNameWithoutAuthor = result.species.scientificNameWithoutAuthor;
        }

        if (firstCommonName !== null && firstScientificNameWithoutAuthor !== null) {
            break;
        }
    }

    return {
        firstCommonName,
        firstScientificNameWithoutAuthor,
    };
}
exports.postToAnswereImage = async (req, res, next) => {

    const filePath = `${req.file.destination}\\${req.file.filename}`;
    const formData = new FormData();

    formData.append('images', fs.createReadStream(filePath));

    Messages_log.findOne({
        where: {
            "چت آیدی": req.session.user.id
        },
        order: [
            ['index', 'DESC']
        ]
    }).then(lastMessage => {
        if (lastMessage !== null) {
            if (lastMessage.dataValues['پیام ارسالی'] !== "/dr") {
                
                axios.post(
                    'https://my-api.plantnet.org/v2/identify/all',
                    formData,
                    {
                        headers: {
                            "Accept": "application/json",
                        },
                        params: {
                            "include-related-images": "false",
                            "no-reject": "false",
                            "lang": "fa",
                            "api-key": "2b10mLhjCL1g8ChRMCNECuAz"
                        },
                    }
                ).then(response => {
                    const speciesInfo = findSpeciesInfo(response.data.results);
                    console.log(`speciesInfo: `,speciesInfo)

                    const data = {
                        "چت آیدی": "67890",
                        "پیام ارسالی": "سلام، وقت بخیر!",
                        "نام کاربر": "سارا",
                        "نام گیاه": speciesInfo.firstCommonName,
                        "نام علمی": speciesInfo.firstScientificNameWithoutAuthor,
                        "کد پیام": req.body.messageId,
                        "آخرین کد پیام": `2024-11-05:0'18"`
                    }
                    console.log(`userId: `, req.session.user.id)
                    Message.create(data).then(() => {
                        Message.findOne({
                            order: [['id', 'DESC']] // ترتیب نزولی بر اساس id
                        }).then((result) => {
                            res.json({
                                bot_message: {
                                    common_name: result['نام گیاه'],
                                    sientific_name: result['نام علمی'],
                                    irrigation: result['یادآوری بعدی'],
                                    light: result['نور مناسب'],
                                    Fertilizer: result['تقویتی مناسب'],
                                    illness: result['آفت شایع'],
                                    "indoor/outdoor": result['محل مناسب نگهداری گیاه']
                                }
                            });
                        });
                    }).catch(err => {
                        res.json({ api_status: '404', bot_message: `🥲شرمنده ولی <br>گیاهت رو نتونستم تشخیص بدم سعی کن عکس بعدی رو اینطوری بفرستی: <br><br>1. فقط 1️⃣ گیاه توی عکس مشخص باشه. <br>2. از قسمت سالم گیاه عکس برام بفرستی{🌱} <br>3. از جهتی عکس بگیری که تمام گیاه رو بتونم ببینم{🪴} <br>` });
                    });


                }).catch(err => {
                    res.json({ api_status: '404', bot_message: "نتونستم اسم گیاهت رو تشخیص بدم" });

                })

            } else {
                Dr_blom.create({
                    userId: req.session.user.id,
                    img: req.body.imageUrl
                }).then(image => {
                    console.log(`savedImage: `, image)
                })
                res.json({
                    api_status: '201', bot_message: `اصلا نگران نباش! <br> گیاهپزشک عکس گیاهت رو بررسی میکنه و تو اولین فرصت مشکلش رو بهت میگه... 🤧`
                });
            }
        }
        const newMessage = {
            "چت آیدی": req.session.user.id,
            "پیام ارسالی": "image",
            "نام کاربر": "pwa",
        }
        Messages_log.create(newMessage)
    })





}

exports.getToLogin = (req, res, next) => {
    res.render(`auth/login`, { title: 'ورود | دستیار مراقبت' })
}

exports.postToLogin = (req, res, next) => {
    console.log(req.body)

    const error = validationResult(req).errors[0];
    if (error) {
        console.log(`err: `, error)
        return res.render(`auth/login`, { title: 'ورود | دستیار مراقبت', error: error })
    }

    User.findOne({
        where:
            { phone: req.body.phone }
    }).then(user => {
        if (!user) {
            const newUser = {
                phone: req.body.phone
            }
            User.create(newUser).then(createdUser => {
                req.session.user = createdUser.dataValues
                req.session.save(() => {
                    if (req.body.invitor) {
                        if (req.body.invitor !== req.session.user.id) {
                            User.update(
                                {
                                    invite_count: sequelize.literal('invite_count + 1')
                                },
                                {
                                    where: {
                                        id: req.body.invitor
                                    }
                                }
                            )
                        }
                    }
                    res.redirect(`/`)
                })

            }).catch(err => {
                console.log(err)
            })
        } else {
            req.session.user = user.dataValues
            req.session.save(() => {
                res.redirect(`/`)
            })

        }
    }).catch(err => {
        console.log(`err`)
    })
}

exports.postCommandAnswer = (req, res, next) => {
    let answer = '';

    switch (req.body.command) {
        case "/buy":
            answer = `
                قابلیت هایی که با خرید اشتراک بهتون میدیم:
                🔬چکاپ دوره ای سلامتی گیاه
                🩺گیاه پزشک آنلاین تخصصی
                ⏰یادآوری کود دهی و سم پاشی گیاهان
                📷دریافت نامحدود اطلاعات گیاهان با گرفتن عکس
                لطفا یکی از گزینه های زیر رو انتخاب کنید:
                <div class="inline_keyboard_rows flex flex-col justify-start items-center absolute left-0 w-full"><div class="inline_keyboard_row flex justify-between items-center w-full"><div class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed"><a href="https://zarinp.al/553035">اشتراک ۳ماهه (۴۵ هزارتومن)</a></div></div><div class="inline_keyboard_row flex justify-between items-center w-full"><div class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed"><a href="https://zarinp.al/553750"> اشتراک ۶ماهه (۷۵ هزارتومن)</a></div></div><div class="inline_keyboard_row flex justify-between items-center w-full"><div class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed"><a href="https://zarinp.al/553698"> اشتراک ۶ماهه (۱۲۰ هزارتومن)</a></div></div></div>
                `;
            break;
        case "/invite":
            answer = `<a href="http://localhost:3000/invite/${req.session.user.id}" class="text-blue-300 underline">localhost:3000/invite/${req.session.user.id}</a><br><br>کافیه هر کسی روی لینک بالا کلیک کنه تا هدیت رو دریافت کنی😉`;
            break;
        case "/start":
            answer = `
                برای استفاده از خدمات بلوم کافیه عکس گیاهت رو بفرستی تا: <br>
                🤖اسم و نیاز هاش رو تشخیص بدم (رایگان) <br>
                🌊 آبیاریش رو تو زمان مناسب بهت یادآوری کنم (رایگان) <br>
                🥀اگه مریض شده باشه نسخه درمانش رو بهت بدم (ویژه) <br>
                🌱 کود و تقویتی مناسبش رو بهت بگم  (ویژه) <br>
                🌒 هر ماه سلامتی گیاهت رو چک کنم  (ویژه) <br>
                <div class="inline_keyboard_rows flex flex-col justify-start items-center absolute left-0 w-full"><div class="inline_keyboard_row flex justify-between items-center w-full"><div onclick="sendInlineKeyboardData(event)" class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed" data-callback="send_photo">ارسال عکس 📸</div></div></div>
                `;
            break;
        case "/dr":
            answer = `
                هر گیاهی که دچار مشکل شده کافیه عکسش رو بفرستی تا گیاه پزشک وضعیت سلامتیش رو چک کنه! 📸
                `;
            const newMessage = {
                "چت آیدی": req.session.user.id,
                "پیام ارسالی": "/dr",
                "نام کاربر": "pwa",
            };
            Messages_log.create(newMessage);
            break;
        case "/profile":
            answer = '';

            User.findOne({
                where: {
                    id: req.session.user.id
                }
            }).then((user) => {
                console.log(user.dataValues);

                Reminder.findAll({
                    where: {
                        chat_id: req.session.user.id.toString().trim()
                    }
                }).then(plants => {
                    plants.forEach(plant => {
                        answer += `🌱 ${plant.dataValues.plant_name}<br>وضعیت سلامتی گیاه: ${plant.dataValues.plant_situation}<br><br>`;
                    });

                    res.json(answer);
                });
            });

            return;
    }

    res.json(answer);
};


exports.getInvite = (req, res, next) => {
    const invitorId = req.params.inviteCode.toString().split("-")[0]
    res.render(`auth/login`, { title: "ورود | دستیار مراقبت", invitor: invitorId })
}