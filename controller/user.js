const User=require("../models/user.js");

module.exports.logout=(req, res, next) => {   // ✅ add next
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!"); // also fixed typo
    res.redirect("/listings");
  });
}


 module.exports.login=async(req, res) => {
    console.log("LOGIN SUCCESS");
    req.flash("success", "Welcome back to WanderLust");
    let redirectUrl=res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  };


  module.exports.renderlogin=(req,res)=>{
    res.render("users/login.ejs");
}

module.exports.rendersignup=(req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    const newuser = new User({ email, username });
    const registeredUser = await User.register(newuser, password);

    console.log(registeredUser);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to WanderLust");

      // ✅ Fix: fallback to /listings
      let redirectUrl = req.session.redirectUrl || "/listings";

      // optional: clean session
      delete req.session.redirectUrl;

      return res.redirect(redirectUrl);
    });

  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("/signup");
  }
};