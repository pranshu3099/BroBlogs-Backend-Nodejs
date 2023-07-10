const { z } = require("zod");

const validate = (obj) => (req, res, next) => {
  const validations = [];
  Object.keys(obj).forEach((x) => {
    const requestObject = req[x];
    validations.push(obj[x].safeParse(requestObject));
  });
  const failures = validations.filter((v) => !v.success);
  if (failures.length) {
    const errors = failures.map((f) =>
      f.error?.issues?.map((i) => ({ message: i.message, path: i.path }))
    );
    return res.status(400).send(errors);
  }

  next();
};

module.exports = { validate };
