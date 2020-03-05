var express = require('express');
var router = express.Router();
const Instagram = require('./instx.js');
var request = require("request");
const FileCookieStore = require('tough-cookie-filestore');
const Telegraf = require('telegraf');
var {Check, InitY, InitH, reset} = require('../yaho/yaho');
var fs = require("fs");

//Cookies File
var cookieStore = new FileCookieStore('./user/cookies.json');

// //Config
// var username = "samawisamer1",
//     password = "";
var Config = JSON.parse(fs.readFileSync("./user/data.json"));

//Set Process False
Config.Start = false;

var client = new Instagram({ cookieStore });

// (async function () {
// await client.login();
// // console.log("logined");
// // var result = await client.getHashtag("love");
// // console.log(result);
// // var s = await client.addComment({ mediaId: result, text: 'hi' });
// // console.log(s);
// })();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
var i = 0;
var c = 0;
var err2 = 0;

async function onError(er, ob) {
  console.log("Error Code: " + er.code);
  stop();
  if (er.code == 2) {
    fs.writeFileSync("user/error.json", JSON.stringify(ob));
    //if (err2 == 1) return tel.reply(`*** ERROR CODE ${er.code} ***`);
    Config.report.errors++;
    err2 = 1;
    // await sleep(1 * 1000);
    // logout();
    // var er1;
    // await client.login({username:Config.user.email, password:Config.user.pass})
    // .catch(e => {er1=1;});
    // if (!isLogin() && er1) {
    //   tel.reply("حدث خطأ بالمصادقة");
    //   stop();
    //   return;
    // }
    // Config.Start = true;
    // Start();
    
    // tel.reply("started");
    // Start();
    tel.reply(`حدث خطأ
    رقم: 2
    تم ايقاف العمليات
    الاجراءات الازمة
    -تسجيل الخروج واعادة الدخول
    -البدأ من جديد`);
    fs.writeFileSync("user/error.json", er.data.toString());
    return;
  }
  tel.reply(`*** ERROR CODE ${er.code} ***`);
  await sleep(10 * 1000 * 60);
  fs.writeFileSync("user/error.json", er.data.toString());
  console.log(er.data);
  Start();
  Config.Start = true;

}


async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function stop() {
  //Stop process
  Config.Start = false;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}
//************** Telegram BOT ***************** *//
const bot = new Telegraf(Config.token);
bot.start((ctx) => {
  var username = ctx.update.message.chat.username;
  if (Config.username !== username) {
    var text = ctx.update.message.text;
    if (text == '1999') {
      
    }
    ctx.reply("تم رفض الوصول");
    return;
  }
  //if (! client.isLogin()) return ctx.reply("Please Login !!");
  ctx.reply("hi");
  
});

bot.use((ctx, next) => {
  try {
    var username = ctx.update.message.chat.username;
  }
  catch (e) {
    var username = "user";
  }
  
  if (username == Config.admin) {
    var text = ctx.update.message.text;
    var sp = text.split(" ");
    var cmd = sp[0];
    var v = sp[1];
    if (cmd == "/setuser") {
      if (!v) return ctx.reply("user not valid");
      Config.username = v;
      saveConfig();
      ctx.reply("Success!");
    }
    else next();
  } else next();
  
});

bot.use((ctx, next) => {
  var username = ctx.update.message.chat.username;
  if (Config.username !== username) {
    ctx.reply("تم رفض الوصول");
    return;
  }
  return next()
});

bot.use((ctx, next) => {
  tel = ctx;
  return next()
});

Config.run = 0;
bot.hears(/بحث/, async (ctx) => {
  var text = ctx.update.message.text;
  if (Config.run != 0) return ctx.reply("الرجاء انتظار انتهاء المهمة الحالية");
  var ob = text.split(" ");
  var type = ob[1];
  var n = +ob[2] || 10;
  var emails = [];
  Config.run = 1;

  //------------------------
  if (type == "عشوائي") {
    // clear random emails
    emails = [];
    for (var ii=0; ii<n; ii++) {
      emails.push(makeid(4) + `@${Config.domain}`);
    };
    ctx.reply(`تم تشغيل العملية
    عدد الاسماء: ${emails.length}`);
  }
  //---------------------------

  var n2 = 0;
  var res = [];

  var asiaTime = new Date().getTime();
  Config.result = (asiaTime);
  saveConfig();
  for (var i in emails) {
    var key = emails[i];
    var list = await search(key)

    .catch(e => {
      console.log("*** Error ***");
       process.exit();
    });

      list.forEach(async data => {
        var userId = data.user.pk;
        if ( !((/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi).test(data.user.full_name)) ) return;
        res.push({email: data.user.full_name, username: data.user.username});
        n2++;
        //ctx.reply(JSON.stringify(res, null ,4));
        fs.writeFileSync("./results/" + Config.result + ".json", JSON.stringify(res, null, 4));
        
      });
      }
    
    console.log(n2);
    Config.run = 0;
    Config.len = Config.i = 0;
    ctx.reply(`تم الانتهاء
    تم العثور على ${res.length} نتيجة`);

});

bot.hears("فحص", async ({reply}) => {
  if (isfile(`./results/${Config.result}.json`)) {
    if (Config.run != 0) return reply("الرجاء انتظار انتهاء المهمة الحالية");
    Config.len = Config.i = 0;
    var emails = fs.readFileSync(`./results/${Config.result}.json`).toString();
    Config.run = 2;
    reply(`جاري فحص المتاحات سنخبرك بعد الانتهاء `);
    emails = JSON.parse(emails);
    Config.len = emails.length;
    var s = [];
    await InitY();
    await InitH();
    var f =0;
    var un = 0;
    for (var u=0; u<emails.length; u++) {
      var usr = emails[u]
      var verify = await Check(usr.email);
      Config.i++;
      if (verify === true ) s.push(usr);
      else if (verify == 'error') {
        console.log('error');
          u--;
          await time(10000);
          continue;
      }
      else if (verify === false) f++;
      else un++;
    }
    fs.writeFileSync(`./results/${Config.result}_checked.json`, JSON.stringify(s));
    var re = `تم الاكتمال
    عدد المتاحات: ${s.length}
    عدد الغير متاح: ${f}`;
    if (un > 0) re += `\n` + `حالة غير معروفة: ${un}`;
    reply(re);
    Config.run = 0;
    console.log(s);
  }
  else reply("لا يوجد شي لفحصه")
});

bot.hears(/سحب المتاحات/, (ctx) => {
  if (isfile(`./results/${Config.result}_checked.json`)) {
    var txt = JSON.parse( fs.readFileSync(`./results/${Config.result}_checked.json`) )
    .map( key => key.email)
    .join("\n");
    // fs.writeFileSync(`./results/temp/${Config.result}_checked.txt`, txt);
    // ctx.replyWithDocument({source: './results/${Config.result}_checked.txt'});
    ctx.reply(txt);
  } else {
    ctx.reply("لا يوجد شيء لسحبه");
  }
});

bot.hears(/\/setdomain|تغير الدومين/, ctx => {
  var text = ctx.update.message.text;
  var domain = text.split(" ")[1];
  if (domain) {
    Config.domain = domain;
    saveConfig();
    ctx.reply("تم الحفظ بنجاح");
  }
  else ctx.reply(`
  /setdomain domain.com`);
});

bot.hears(/\status|الحالة/, ctx => {
  if (Config.run = 0) ctx.reply('الحالة: العمليات متوقفه');
  else ctx.reply(`جاري الفحص
  اكتمل ${Config.i} من ${Config.len}`);
})

bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'));

bot.command("login", async (ctx) => {
  var text = ctx.update.message.text;
  tel = ctx;
  var ob = text.split(" ");
  var username = ob[1];
  var password = ob[2];
  if ( !(username && password) )  {
    return ctx.reply(`Use:\n/login [YourUsername] [YourPassword]`);
  }
  var e;
  await client.login({username, password}).catch(er => {e=1});
  if (!e && client.isLogin()) {
    ctx.reply('تم تسجيل الدخول بنجاح');
    Config.user = {
      email:username,
      pass:password
    }
    saveConfig();
  }
  else {
    ctx.reply("فشلت المصادقة");
  }
  
});


bot.hears("/logout", async ctx => {
  if (Config.Start) {
    return ctx.reply("يجب ايقاف العمليات قبل هذا الاجراء");
  }
  logout();
  ctx.reply("تمت العملية بنجاح");
})

bot.launch();
//********************************************************************** */

// ******** function ***************
function saveConfig() {
  fs.writeFileSync("./user/data.json", JSON.stringify(Config, null, 4));
}

function logout() {
  fs.writeFileSync("./user/cookies.json", "{}", "UTF-8");
   cookieStore = new FileCookieStore('./user/cookies.json');
  client = new Instagram({ cookieStore });
}

async function search(name) {
  var list = await client.search({ query: name })
  .catch(err => {
      throw err;
  });
  return list.users;
  //console.log(user);
  }

  async function Search() {
    var list = fs.readFileSync('./list.txt').toString()
    .split("\n");
    for (var i=0; i<list.length; i++) {
      var err = false;
      var ob = await search(list[i]).catch(async e => {
        err = true;
      });
      if (err == true) {
        console.log("Waiting ...");
        await sleep(20000);
        i--;
        continue;
      }
      console.log(i + ": " + ob.user.full_name + "(" + ob.user.username + ")" + ": " + "(" + ob.len + ")");
      await sleep(100);
    }
    return true;
  }

    function makeid(length) {
   var result           = '';
   var characters       = '1234567890abcdeqwrtyuioplkjhgfdsazxcvbnm';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function isfile(path) {
  var res;
  try {
  if (fs.existsSync(path)) {
    res = true;
  } else res = false;
} catch(err) {
  res = false;
}
return res;
}


/* Skip Automatic Stop the Server */
/* Some free hosting stops the server  if it is not active during a short period like "reple.it" */
// if (Config.url) {
//   setInterval(() => {
// request.get(Config.url, () => {console.log(Config.url)});
// }, 1 * 1000 * 60);
// }


module.exports = router;
