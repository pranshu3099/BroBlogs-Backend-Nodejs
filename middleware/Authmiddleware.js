const { z } = require("zod");

const signupValidation = (data) => {
  const validateName = z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  });
  try {
    if (validateName.nonempty()) {
      if (validateName.parse(data.name)) {
        console.log("okks");
      }
    }
  } catch (err) {
    console.log(JSON.parse(err.message)?.map((x) => x.message));
  }
  // if(validateName.max(100) && validateName.min(2))
};

module.exports = {
  signupValidation,
};
