const validator = require("validator")

const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;

    if (!firstName || !lastName) {
        throw new Error("Name is not valid");
    } else if (firstName.length < 3 || firstName.length > 50) {
        throw new Error("firstName should be 3 to 50 characters");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Create a strong password");
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Invalid email address");
    }
}

const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "emailId", "photoUrl", "gender", "age", "about", "skills"]

    const isEditAllowed = Object.keys(req.body).every((field) => {
        return allowedEditFields.includes(field);
    })

    return isEditAllowed
}

module.exports = {
    validateSignupData,
    validateEditProfileData
}