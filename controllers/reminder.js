const Reminder = require('../models/reminder');
const Remind_again = require('../models/remind_again');
const Dr_blom = require('../models/dr_blom');
const { where, fn, col, Op } = require('sequelize');


exports.getremider = (req, res, next) => {
    const currentTime = new Date();
    const currentHour = +currentTime.getHours();
    
    const currentDay = new Date().toISOString().split("T")[0]; // فرمت YYYY-MM-DD
    let messagesArray = [];
    let IDs = [];
    Reminder.findAll({
        where: {
            [Op.and]: [
                fn('DATE', col('next_remind')) === currentDay,
                { "ساعت یادآوری": currentHour },
                { messenger: "pwa" }
            ]
        }
    }).then(rows => {
        const inlineKeyboard = `<div class="inline_keyboard_rows flex flex-col justify-start items-center absolute left-0 w-full"><div class="inline_keyboard_row flex justify-between items-center w-full"><div onclick="sendInlineKeyboardData(event)" class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed" data-callback="iriggation_done">آب دادم</div><div onclick="sendInlineKeyboardData(event)" class="inline_keyboard_button w-full text-black m-1 flex justify-center items-center p-1 rounded text-white shadowed" data-callback="remind_again">دوباره یادم بنداز</div></div></div>`
        if (rows.length > 0) {  // بررسی کنید که آیا رکوردی برگشته است یا نه
            rows.forEach(row => {
                messagesArray.push({
                    text: row._previousDataValues.remind + inlineKeyboard,
                    index: row._previousDataValues.index,
                });
                IDs.push(row._previousDataValues.index)
            });
        } else {
            console.log("هیچ رکوردی یافت نشد.");
        }
        Reminder.update(
            { last_remind: currentDay },
            {
              where: {
                id: {
                  [Op.in]: IDs
                }
              }
            }
          )
        Remind_again.findAll({
            where: {
                [Op.and]: [
                    fn('DATE', col('یاداوری بعدی')) === currentDay,
                    { "ساعت یادآوری": currentHour },
                    { "پیامرسان": "pwa" }
                ]
            }
        }).then(remind_again_rows => {
            if (remind_again_rows.length > 0) {
                remind_again_rows.forEach(row => {
                    messagesArray.push({
                        text: row._previousDataValues['یاداوری'],
                        index: row._previousDataValues.index,
                    });
                });
            } else {
                console.log("هیچ رکوردی یافت نشد.");
            }
            res.json({ messagesArray });
        })
    }).catch(error => {
        console.error("خطا در هنگام جلب داده‌ها:", error);
        res.status(500).json({ error: "خطا در جلب داده‌ها" });
    });
}


exports.getDr_blom = (req, res, next) => {
    let messagesArray = []

    Dr_blom.findAll({
        where: {
            [Op.and]: [
                { userId: +req.session.user.id }, // Ensure it's a valid number
                { done: 1 },
                { showen: 0 },
            ]
        }
    }).then(rows => {
        rows.forEach(row => {
            console.log(row)
            console.log(row.dataValues.id)
            messagesArray.push(row.dataValues.answer)
            Dr_blom.update(
                { showen: 1 },
                {
                    where: { id: row.dataValues.id }
                }
            ).then(() => {
                console.log(`then`)
            })
        })
        console.log(messagesArray)
        res.json({ messagesArray })
    })

}