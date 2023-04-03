const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const ReviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            required: [true, 'Please provide rating'],
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            required: [true, 'Please provide review title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        comment: {
            type: String,
            required: [true, 'Please provide review comment'],
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
    },
    { timestamps: true }
)

ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

ReviewSchema.statics.calculateAverageRating = async function (productId) {
    const result = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 },
            },
        },
    ])
    console.log('result', result)
    try {
        await this.model('Product').findOneAndUpdate(
            { _id: productId },
            {
                averageRating: Math.ceil(result[0]?.averageRating || 0),
                numOfReviews: result[0]?.numOfReviews || 0,
                // if there are no reviews these fields won't exist so ? and || 0 will handle that
            }
        )
    } catch (error) {
        console.log(error)
    }
}

ReviewSchema.post('save', async function () {
    await this.constructor.calculateAverageRating(this.product)
})
ReviewSchema.post('remove', async function () {
    await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)
