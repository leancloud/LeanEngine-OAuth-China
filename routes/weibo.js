var router = require('express').Router(),
  passport = require('passport'),
  WeiboStrategy = require('passport-weibo').Strategy,
  request = require('request');

var WEIBO_CLIENT_ID = "在这里填写微博应用的 App ID";
var WEIBO_CLIENT_SECRET = "在这里填写微博应用的 App Secret";

var ACCESSTOKEN = "";

// passport 组件所需要实现的接口
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// passport 的  WeiboStrategy 所必须设置的参数
passport.use(new WeiboStrategy({
    clientID: WEIBO_CLIENT_ID, // App ID
    clientSecret: WEIBO_CLIENT_SECRET, // App Secret
    callbackURL: "http://127.0.0.1:3000/weibo/auth/callback" // 回调地址，此处是为了本地调试
  },
  function(accessToken, refreshToken, profile, done) {

    process.nextTick(function() {
      // 此处在服务端存储 ACCESSTOKEN 是为了后续发送微博所需要的必要参数
      // 实际生产项目中，是需要持久化存储这个 ACCESSTOKEN 到数据库里面
      ACCESSTOKEN = accessToken;
      console.log("accessToken:" + accessToken);
      return done(null, profile);
    });
  }
));

// 发起授权认证请求，用户主动发起
router.get('/auth/',
  passport.authenticate('weibo'),
  function(req, res) {
    // The request will be redirected to Weibo for authentication, so this
    // function will not be called.
  });

// 用户授权完整之后回调到这个路由
router.get('/auth/callback',
  passport.authenticate('weibo', {
    failureRedirect: '/'
  }),
  function(req, res) {
    // 如果授权了你的应用就会走到这个路由
    // 在当前实例下，我们设置用户授权成功之后，我们跳转到 share 路由下
    res.redirect('/weibo/share');
  });


router.get('/share',
  function(req, res) {
    // 跳转到这里之后，我们让用户跳转到发送微博的页面
    res.render('post', {});
  });

// 这里调用了微博发送的接口，发送一条全新的微博
router.post('/post', function(req, res) {
  console.log(req.body.status);
  request.post({
    url: 'https://api.weibo.com/2/statuses/update.json',
    form: {
      access_token: ACCESSTOKEN,
      status: req.body.status
    }
  }, function(err, httpResponse, body) {
    if (err) {

    } else {
      console.log(httpResponse.body);
      res.send("分享成功！");
    }

  })
});

module.exports = router;
