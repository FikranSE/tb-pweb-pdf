require("dotenv").config();
const fs = require('fs');
const express = require('express')
const mysql = require('mysql2')
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path=require("path");
const moment = require('moment');
const multer = require('multer');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const app = express()
const port = 3000

//buat folder penampung file jika tidak ada
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// middleware untuk parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


app.set('views', path.join(__dirname, '/views'));

app.use('/css', express.static(path.resolve(__dirname, "assets/css")));
app.use('/img', express.static(path.resolve(__dirname, "assets/img")));
app.use('/submission', express.static('/img'));

// template engine
app.set('view engine', 'ejs')

// layout ejs
app.use(expressLayouts);

// mengatur folder views
app.set('views', './views');
// Middleware session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Middleware flash messages
app.use(flash());

// Create multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create multer upload configuration
const upload = multer({ storage: storage });

// create the connection to database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
});

//database connection
db.connect((err)=>{
  if(err) throw err
  console.log('database connected..')
})

const saltRounds = 10;
//=======================================================================================================================
//                                                    FIKRAN
//=======================================================================================================================
//register dan login
app.get('/register', function (req, res) {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = ''; // Clear the error message from session
  const successMessage = req.session.successMessage;
  req.session.successMessage = '';
  res.render('register',{
    title:'Register',
    layout:'layouts/auth-layout',
    errorMessage : errorMessage,
    successMessage : successMessage
  });
})

app.post('/register', function (req, res) {
  const { email, username, password, confirm_password } = req.body;

  // check if username already exists
  const sqlCheck = 'SELECT * FROM users WHERE username = ?';
  db.query(sqlCheck, username, (err, result) => {
    if (err) throw err;
      console.log("tes");
    if (result.length > 0) {
      console.error({ message: 'Username sudah terdaftar', err });
      req.session.errorMessage = 'Username sudah terdaftar';
      return res.redirect('/register');
    }

    if (password !== confirm_password) {
      console.error({ message: 'Password tidak cocok!', err });
      req.session.errorMessage = 'Password tidak cocok!';
      return res.redirect('/register');
    }

    // hash password
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) throw err;

      // insert user to database
      const sqlInsert = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
      const values = [email, username, hash];
      db.query(sqlInsert, values, (err, result) => {
        if (err) throw err;
        console.log({ message: 'Registrasi berhasil', values });
        res.redirect('/login');
      });
    });
  });
});


// login page
app.get('/login', function (req, res) {
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = ''; // Clear the error message from session
  const successMessage = req.session.successMessage;
  req.session.successMessage = '';
  res.render('login',{
    title:'Login',
    layout:'layouts/auth-layout',
    errorMessage : errorMessage,
    successMessage : successMessage
  });
})

app.post('/login', function (req, res) {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], function(err, result) {
    if (err) {
      console.error({ message: 'Internal Server Error', err });
      req.session.errorMessage = 'Internal Server Error';
      return res.redirect('/login');
    }
    if (result.length === 0) {
      console.error({ message: 'Username atau Password salah!!', err });
      req.session.errorMessage = 'Username atau Password salah!!';
      return res.redirect('/login');
    }

    const user = result[0];

    // compare password
    bcrypt.compare(password, user.password, function(err, isValid) {
      if (err) {
        console.error({ message: 'Internal Server Error', err });
        req.session.errorMessage = 'Internal Server Error';
        return res.redirect('/login');
      }

      if (!isValid) {
        console.error({ message: 'Username atau Password salah!!', err });
        req.session.errorMessage = 'Username atau Password salah!!';
        return res.redirect('/login');
      }

      // generate token
      const token = jwt.sign({ user_id: user.user_id }, 'secret_key');
      res.cookie('token', token, { httpOnly: true });

      console.log({ message: 'Login Berhasil', user });
      return res.redirect('/');
    });
  });
});

// logout
app.get('/logout', function(req, res) {
  res.clearCookie('token');
  res.redirect('/login');
});

// middleware untuk memeriksa apakah user sudah login atau belum
function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.redirect('/login');
    return;
  }
  

  jwt.verify(token, 'secret_key', function(err, decoded) {
    if (err) {
      res.redirect('/login');
      return;
    }

    req.user_id = decoded.user_id;
    next();
  });
}

// index page
app.get('/', requireAuth, function (req, res) {
  if (!req.user_id) {
    res.redirect('/login');
    return;
  }

  const user_id = req.user_id;

  const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;

  db.query(selectUserSql, (err, userResult) => {
    if (err) {
      throw err;
    }

    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = ''; // Clear the error message from session
    const successMessage = req.session.successMessage;
    req.session.successMessage = '';

    const selectSql = `SELECT forms.*, users.username
    FROM forms
    INNER JOIN enrollments ON forms.enroll_key = enrollments.enroll_key
    INNER JOIN users ON forms.user_id = users.user_id
    WHERE enrollments.user_id = ${user_id}
    `;

    db.query(selectSql, (err, result) => {
      if (err) {
        throw err;
      }
      res.render('index', {
        user: userResult[0], // Assuming there's only one user with the given user_id
        forms: result,
        moment: moment,
        title: 'Dashboard',
        layout: 'layouts/main-layout',
        errorMessage: errorMessage,
        successMessage: successMessage
      });
    });
  });
});

// Function to generate enroll key with specified length
function generateEnrollKey(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let enrollKey = '';
  for (let i = 0; i < length; i++) {
    enrollKey += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return enrollKey;
}

app.post('/enroll', requireAuth, function (req, res) {
  const enroll_key = req.body.enroll_key;
  const user_id = req.user_id; // Dapatkan user_id dari user yang sedang login

  // Check if enroll key exists in the forms table
  const selectSql = 'SELECT * FROM forms WHERE enroll_key = ?';
  db.query(selectSql, [enroll_key], (err, formResult) => {
    if (err) {
      console.error({ message: 'Internal server erorr', err });
      req.session.errorMessage = 'Internal server erorr';
    }

    if (formResult.length > 0) {
      const formUserId = formResult[0].user_id;

      if (formUserId === user_id) {
        // User is trying to enroll their own form, show error message or redirect to an error page
        console.error({ message: 'Anda tidak bisa enroll form sendiri' });
        req.session.errorMessage = 'Anda tidak bisa enroll form sendiri';
      } else {
        // Check if enroll key exists for the user in the enrollments table
        const enrollmentsSql = 'SELECT * FROM enrollments WHERE user_id = ? AND enroll_key = ?';
        db.query(enrollmentsSql, [user_id, enroll_key], (enrollmentsErr, enrollmentsResult) => {
          if (enrollmentsErr) {
            console.error({ message: 'Internal server erorr', enrollmentsErr });
            req.session.errorMessage = 'Internal server erorr';
          }

          if (enrollmentsResult.length > 0) {
            // User has already enrolled for this form, show error message or redirect to an error page
            console.error({ message: 'Anda sudah enroll pada form ini!' });
            req.session.errorMessage = 'Anda sudah enroll pada form ini!';
          } else {
            // Insert enroll_key into enrollments table
            const insertSql = 'INSERT INTO enrollments (user_id, enroll_key) VALUES (?, ?)';
            const values = [user_id, enroll_key];
            db.query(insertSql, values, (insertErr, insertResult) => {
              if (insertErr) {
                throw insertErr;
              }

              console.error({ message: 'Enrollment berhasil' });
              req.session.successMessage = 'Enrollment berhasil';
              res.redirect('/');
            });
          }
        });
      }
    } else {
      // Enroll key is not valid, show error message or redirect to an error page
      res.send('Invalid enroll key');
    }
  });
});

//add-form page
app.get('/add-form', requireAuth, function (req, res) {
  let user_id = req.user_id;
  const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
  db.query(selectUserSql, (err, Result) => {
    if (err) throw err;
    res.render('add-form', {
      user: Result[0],
      title: 'add form',
      layout: 'layouts/main-layout'
    });
  });
})

//detail form
app.get('/detail-form/:form_id', requireAuth, function(req, res) {
  const user_id = req.user_id;
  const form_id = req.params.form_id;

  // check if user is the creator of the form
  const formSql = 'SELECT * FROM forms WHERE form_id = ?';
  db.query(formSql, [form_id], function (err, formResult) {
    if (err) throw err;

    const formCreator = formResult[0].user_id;
    if (user_id === formCreator) {
      res.send('You cannot submit your own form');
      return;
    }

    // check if user has submitted the form
    const submissionSql =
      'SELECT * FROM submissions WHERE form_id = ? AND user_id = ?';
    db.query(submissionSql, [form_id, user_id], function (
      err,
      submissionResult
    ) {
      if (err) throw err;

      let isSubmitted = false;
      let submission = null;

      if (submissionResult.length > 0) {
        isSubmitted = true;
        submission = submissionResult[0];
      }

      const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;

      db.query(selectUserSql, function (err, userResult) {
        if (err) throw err;

        res.render('detail-form', {
          user: userResult[0],
          form: formResult[0],
          moment: moment,
          title: 'Detail form',
          layout: 'layouts/main-layout',
          isSubmitted: isSubmitted,
          submission: submission
        });
      });
    });
  });
});


//my form page
app.get('/myForm', requireAuth, function (req, res) {
  const user_id = req.user_id;
  const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;

  db.query(selectUserSql, function (err, userResult) {
    if (err) throw err;

    const selectSql =
      'SELECT forms.*, users.* FROM forms INNER JOIN users ON users.user_id = forms.user_id WHERE users.user_id = ?';
    db.query(selectSql, [user_id], function (err, formResult) {
      if (err) throw err;
      res.render('myForm', {
        user: userResult[0],
        forms: formResult,
        moment: moment,
        title: 'My Form',
        layout: 'layouts/main-layout'
      });
    });
  });
});


//detail form
app.get('/detailMyForm/:form_id', requireAuth, function (req, res) {
  const user_id = req.user_id;
  const form_id = req.params.form_id;

  // check if user is the creator of the form
  const formSql = 'SELECT * FROM forms WHERE form_id = ?';
  db.query(formSql, [form_id], function (err, formResult) {
    if (err) throw err;

    const respondentSql = `SELECT users.*, forms.form_id, submissions.uploaded_file, submissions.created_at
    FROM users
    INNER JOIN submissions ON users.user_id = submissions.user_id
    INNER JOIN forms ON submissions.form_id = forms.form_id
    WHERE submissions.form_id = ?`;
    db.query(respondentSql, [form_id], function (err, respondenResult) {
      if (err) throw err;

    const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
    db.query(selectUserSql, function (err, userResult) {
      if (err) throw err;

      res.render('detailMyForm', {
        user: userResult[0],
        form: formResult[0],
        respondents: respondenResult,
        moment: moment,
        title: 'Detail my form',
        layout: 'layouts/main-layout'
      });
     });
    })
  });
});



//download file pada detail pengumuman
app.get('/download/:user_id/:form_id', requireAuth, (req, res) => {
  const userId = req.params.user_id;
  const formId = req.params.form_id;

  // check if user has access to the form
  const formSql = 'SELECT * FROM forms WHERE form_id = ?';
  db.query(formSql, [formId], function(err, formResult) {
    if (err) throw err;
    if (formResult.length === 0) {
      res.status(404).send('Form not found');
      return;
    }

    // check if submission exists
    const submissionSql = 'SELECT * FROM submissions WHERE user_id = ? AND form_id = ?';
    db.query(submissionSql, [userId, formId], function(err, submissionResult) {
      if (err) throw err;
      if (submissionResult.length === 0) {
        res.status(404).send('Submission not found');
        return;
      }

      const submission = submissionResult[0];
      const filePath = `uploads/${submission.uploaded_file}`;

      res.download(filePath, submission.file_name, function(err) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal server error');
        }
      });
    });
  });
});

//download file pada detail pengumuman
app.get('/download/:user_id/:form_id', requireAuth, (req, res) => {
  const userId = req.params.user_id;
  const formId = req.params.form_id;

  // check if user has access to the form
  const formSql = 'SELECT * FROM forms WHERE form_id = ?';
  db.query(formSql, [formId], function(err, formResult) {
    if (err) throw err;
    if (formResult.length === 0) {
      res.status(404).send('Form not found');
      return;
    }

    // check if submission exists
    const submissionSql = 'SELECT * FROM submissions WHERE user_id = ? AND form_id = ?';
    db.query(submissionSql, [userId, formId], function(err, submissionResult) {
      if (err) throw err;
      if (submissionResult.length === 0) {
        res.status(404).send('Submission not found');
        return;
      }

      const submission = submissionResult[0];
      const filePath = `uploads/${submission.uploaded_file}`;

      res.download(filePath, submission.file_name, function(err) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal server error');
        }
      });
    });
  });
});

//profil page
app.get('/profil', requireAuth, function (req, res) {
  let user_id = req.user_id;
  const selectSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
  db.query(selectSql, (err,result)=>{
    if (err) throw err;
    // Periksa apakah user sudah login dan aktif
    if (result[0].active === 0) {
      res.render('profil',{
        user: result[0],
        title:'Profil',
        layout:'layouts/main-layout'
      })
    } else {
      // Jika user tidak aktif, arahkan kembali ke halaman login
      res.redirect('/login');
    }
  })
})

//edit user page
app.get('/edit-profil',requireAuth, function (req, res) {
  let user_id = req.user_id;
  const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
  db.query(selectUserSql, (err, Result) => {
    if (err) throw err;
    res.render('edit-profil', {
      user: Result[0],
      title: 'edit profil',
      layout: 'layouts/main-layout'
    });
  });
})
//=========================================================================================================================

//=======================================================================================================================
//                                                    ILHAM
//=======================================================================================================================

// Handle file upload
app.post('/submit-form', upload.single('uploaded_file'), requireAuth, (req, res) => {
  
  const { form_id,description } = req.body;
  const uploaded_file = req.file.filename;

  const user_id = req.user_id;

  // Check if user has already submitted for the form
  const submissionSql = `SELECT * FROM submissions WHERE user_id = ? AND form_id = ?`;
  const submissionValues = [user_id, form_id];
  db.query(submissionSql, submissionValues, (err, submissionResult) => {
    if (err) {
      throw err;
    }

    // Insert data to MySQL
    const insertSql = `INSERT INTO submissions (user_id, form_id, uploaded_file, description) VALUES (?, ?, ?, ?)`;
    const insertValues = [user_id, form_id, uploaded_file, description];
    db.query(insertSql, insertValues, (err, result) => {
      if (err) {
        throw err;
      }
      console.log({ message: 'Submission complete!', insertValues });
    res.redirect('/');
    });
  });
});


//ganti password
app.post('/ganti-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user_id;

  // Check if current password matches with database
  const sql = 'SELECT password FROM users WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log({ message: 'Internal Server Error', err });
      
    }

    const hashedPassword = result[0].password;
    bcrypt.compare(currentPassword, hashedPassword, (error, isMatch) => {
      if (error) {
        console.log({ message: 'Internal Server Error', err });
      }

      if (isMatch) {
        // If current password matches, hash new password and update database
        bcrypt.hash(newPassword, saltRounds, (err, hashedNewPassword) => {
          if (err) {
            console.log({ message: 'Internal Server Error', err });
          }

          const updateSql = 'UPDATE users SET password = ? WHERE user_id = ?';
          const values = [hashedNewPassword, userId];
          db.query(updateSql, values , (err, result) => {
            if (err) {
              console.log({ message: 'Internal Server Error', err });
            }
            console.log({ message: 'Password berhasil diubah', values });
            res.redirect('/');
          });
        });
      } else {
        // If current password doesn't match, send error message
        console.log({ message: 'Invalid current password', err });
        res.redirect('/profil');
      }
    });
  });
});

//=====================================================================================================================================











//=======================================================================================================================
//                                                    DIO
//=======================================================================================================================
// Handle file upload
app.post('/edit-profil', upload.single('avatar'), requireAuth, (req, res) => {
  let user_id = req.user_id;
  const { email } = req.body;
  const avatar = req.file.filename;

  // Insert data to MySQL
  const updateUserSql = `UPDATE users SET email=?, avatar=? WHERE user_id=${user_id}`;
  const values = [email, avatar];
  db.query(updateUserSql, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log({msg:'data profil telah diupdate'},values);
    // Copy file to img directory
    const source = path.join(__dirname, 'uploads', avatar);
    const destination = path.join(__dirname, 'assets', 'img', avatar);
    fs.copyFileSync(source, destination);

    res.redirect('/profil');
  });
});

// add form post
app.post('/add-form', requireAuth, function (req, res) {
  const user_id = req.user_id;
  const title = req.body.title;
  const description = req.body.description;

  // Generate enroll key
  const enrollKey = generateEnrollKey(6); 

  const sql = 'INSERT INTO forms (user_id, title, description, enroll_key) VALUES (?, ?, ?, ?)';
  const values = [user_id, title, description,enrollKey];
  db.query(sql, values, (err, result) => {
    if (err) {
      throw err;
    }
    console.log({ message: 'Form berhasil dibuat', values });
    req.session.successMessage = 'Form berhasil dibuat';
    res.redirect('/');
  });
});

app.listen(port,()=>{
  console.log(`listening on port ${port}`)
})