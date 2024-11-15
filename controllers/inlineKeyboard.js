const Reminder = require('../models/reminder');
const Remind_again = require(`../models/remind_again`)
const { where, fn, col, Op } = require('sequelize');


// تابع برای ذخیره اطلاعات در دیتابیس  
const submitPlant = (req, plantname, cb) => {
    const newRemind = {
        chat_id: req.session.user.id,
        messenger: "pwa",
        "نام کاربر": "",
        plant_name: String(plantname), // اطمینان از اینکه plant_name به string تبدیل شده است  
        today: new Date().toISOString().split("T")[0],
        "ساعت یاداوری": 19
    };

    // ذخیره اطلاعات در دیتابیس  
    Reminder.create(newRemind)
        .then(result => {
            cb(null, result); // ارسال نتیجه به callback (خطا در صورت نبودن)  
        })
        .catch(error => {
            console.error('Error creating reminder:', error);
            cb(error, null); // در صورت خطا، ارور را به callback ارسال می‌کنیم  
        });
};

const setRiminderHour = (req, hour, messageId, messageText)=>{
    Reminder.update(
        { "ساعت یادآوری": hour },
        {
            where: {
                [Op.and]: [
                    { chat_id: +req.session.user.id },
                    { plant_name: "انبه ماریان" }
                ]
            }
        }
    ).then(([rowsUpdated]) => {
        if (rowsUpdated > 0) {
            console.log("Update successful");
        } else {
            console.log("No rows updated");
        }
    }).catch(error => {
        console.error("Error updating reminder:", error);
    });
    action = "edit";
    message_id = messageId;
    text = `${messageText.split("----")[0]}<br><br>اگه امروز به گلت آب ندادی حتما بهش آب بده! از این به بعد خودم نیاز هاش رو بهت یادآوری میکنم 😎`;
}

let action;
let text;
let inlineKeyboard;
let message_id;
let messageType;

// پاسخ به دکمه‌های مختلف  
const answer = (input, messageText, messageId, plant_name, req, cb) => {
    let responseSent = false;

    switch (input) {
        case "submit":
            action = "edit";
            text = `${messageText.split("----")[0]}<br><br>----<br>⌚دوست داری تو چه ساعتی از روز نیاز های گیاهت رو یادت بندازم؟`;
            messageType = "submit"
            inlineKeyboard = `  
                <div class="inline_keyboard_rows flex flex-col justify-start items-center absolute left-0 w-full">  
                    <div class="inline_keyboard_row flex justify-between items-center w-full">  
                        <div onclick="sendInlineKeyboardData(event)" class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed" data-callback="reminder_09" data-plant-name="${plant_name}">۹ صبح</div>  
                        <div onclick="sendInlineKeyboardData(event)" class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed" data-callback="reminder_11" data-plant-name="${plant_name}">۱۱ ظهر</div>  
                    </div>  
                    <div class="inline_keyboard_row flex justify-between items-center w-full">  
                        <div onclick="sendInlineKeyboardData(event)" class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed" data-callback="reminder_19" data-plant-name="${plant_name}">۷ شب</div>  
                        <div onclick="sendInlineKeyboardData(event)" class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed" data-callback="reminder_21" data-plant-name="${plant_name}">۹ شب</div>  
                    </div>  
                </div>`;
            message_id = messageId;

            submitPlant(req, plant_name, (error, result) => {
                if (error) {
                    if (!responseSent) {
                        responseSent = true;
                        return cb({ action: "send", text: "خطا در ایجاد یادآور", inlineKeyboard: "", message_id: "" });
                    }
                }

                if (!responseSent) {
                    responseSent = true;
                    cb({ action, text, inlineKeyboard, message_id });
                }
            });
            break;

        case "send_photo":
            action = "send";
            text = `برای اینکه گیاهتو بهتر تشخیص بدم اینطوری عکس بگیر:
                <br><br>
                1. فقط 1️⃣ گیاه توی عکس مشخص باشه.<br>
                2. از قسمت سالم گیاه عکس برام بفرستی{🌱}<br>
                3. از جهتی عکس بگیری که تمام گیاه رو بتونم ببینم{🪴}`;
            if (!responseSent) {
                responseSent = true; // پاسخ ارسال شد  
                cb({ action, text });
            }
            break;

        case "iriggation_done":
            action = "delete";
            message_id = messageId;
            break;
        case "remind_again":
            action = "edit";
            text = "چند ساعت دیگه دوباره یادت میندازم!";
            message_id = messageId;
            const currentHour = +(new Date().getHours());
            const next_hour = currentHour == 9 ? 11 : currentHour == 11 ? 19 : currentHour == 19 ? 21 : 9;
            const next_day = currentHour == 21 ? new Date().toISOString().split("T")[0] : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0];
            console.log(req.body.messageText)
            Remind_again.create({
                "چت آیدی": req.session.user.id,
                "پیامرسان": "pwa",
                "نام کاربر": "pwa",
                "یاداوری": req.body.messageText,
                "یاداوری بعدی": next_day,
                "ساعت یادآوری": next_hour
            }).then((newRemind) => {
                // console.log(newRemind)
            })
            break;

        case "reminder_09":
            setRiminderHour(req, 9, messageId, messageText)
            action = "edit";
            message_id = messageId;
            text = `${messageText.split("----")[0]}<br><br>اگه امروز به گلت آب ندادی حتما بهش آب بده! از این به بعد خودم نیاز هاش رو بهت یادآوری میکنم 😎`;
            break;
        case "reminder_11":
            setRiminderHour(req, 11, messageId, messageText)
            action = "edit";
            message_id = messageId;
            text = `${messageText.split("----")[0]}<br><br>اگه امروز به گلت آب ندادی حتما بهش آب بده! از این به بعد خودم نیاز هاش رو بهت یادآوری میکنم 😎`;
            break;
        case "reminder_19":
            setRiminderHour(req, 19, messageId, messageText)
            action = "edit";
            message_id = messageId;
            text = `${messageText.split("----")[0]}<br><br>اگه امروز به گلت آب ندادی حتما بهش آب بده! از این به بعد خودم نیاز هاش رو بهت یادآوری میکنم 😎`;
            break;
        case "reminder_21":
            setRiminderHour(req, 21, messageId, messageText)
            action = "edit";
            message_id = messageId;
            text = `${messageText.split("----")[0]}<br><br>اگه امروز به گلت آب ندادی حتما بهش آب بده! از این به بعد خودم نیاز هاش رو بهت یادآوری میکنم 😎`;
            break;

        default:
            action = "";
            text = "";
            break;
    }

    // ارسال نتیجه نهایی به callback  
    if (!responseSent) {
        responseSent = true; // پاسخ ارسال شد  
        cb({ action, text, inlineKeyboard, message_id });
    }
};

// ارسال جواب به کلاینت  
exports.postinlineKeyboardAnswer = (req, res, next) => {
    const callbackText = req.body.callbackText;
    const messageId = req.body.messageId;
    const messageText = req.body.messageText;

    answer(callbackText, messageText, messageId, req.body.plant_name, req, (response) => {
        console.log(response);
        if (response) {
            // ارسال فقط یک پاسخ  
            return res.json({ arguments: response });
        }
        // در صورت بروز مشکل، ارسال ارور  
        return res.status(500).json({ error: "An unexpected error occurred" });
    });
};