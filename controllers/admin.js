const Dr_blom = require(`../models/dr_blom`)

exports.getDr_blom = (req, res, next) => {
    console.log(`blom`)
    Dr_blom.findAll({
        where: { done: 0 }
    }).then(plants => {
        const plantsArray = [];
        plants.forEach(element => {
            plantsArray.push({ url: element.dataValues.img, id: element.dataValues.id });
        })
        console.log(plants)
        res.render(`admin/dr_blom`, { plants: plantsArray });
    })
}

exports.postAnswer = (req, res, next) => {
    console.log(req.body)
    Dr_blom.update(
        {
            answer: req.body.text,
            done: 1
        },
        {
            where: { id: req.body.image }
        }
    ).then(() => res.json({ result: `done` }))
}