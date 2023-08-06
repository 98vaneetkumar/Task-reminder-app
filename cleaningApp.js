var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressLayouts = require("express-ejs-layouts");
var session = require("express-session");
const basemiddleware = require("./helper/basemiddleware");
const fileUpload = require("express-fileupload");

var indexRouter = require("./routes/index");
var adminRouter = require("./routes/admin");

var app = express();

app.use(fileUpload());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "./layout/abc.ejs");
app.set("view engine", "ejs");

app.set("trust proxy", 1);
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 365 * 1000,
    },
  })
);
app.use(basemiddleware);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err)
  // res.render("error");
});

app.listen(4006, (err) => {
  if (err) {
    console.log(err, "-----------showingerrerr");
  }
  console.log("port running on 4006");
});

module.exports = app;
