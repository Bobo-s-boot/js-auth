// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

const { User } = require('../class/user')
const { Confirm } = require('../class/confirm')
const { Session } = require('../class/session')
const { token } = require('morgan')

User.create({
  email: 'test@email.com',
  password: 123,
  role: 1,
})

// ================================================================

// router.get Створює нам один ентпоїнт

// ↙️ тут вводимо шлях (PATH) до сторінки
router.get('/signup', function (req, res) {
  // res.render генерує нам HTML сторінку

  // ↙️ cюди вводимо назву файлу з сontainer
  return res.render('signup', {
    // вказуємо назву контейнера
    name: 'signup',
    // вказуємо назву компонентів
    component: [
      'back-button',
      'field',
      'field-password',
      'field-checkox',
      'field-select',
    ],

    // вказуємо назву сторінки
    title: 'Signup page',
    // ... сюди можна далі продовжувати додавати потрібні технічні дані, які будуть використовуватися в layout

    // вказуємо дані,
    data: {
      role: [
        { value: User.USER_ROLE.USER, text: 'User' },
        {
          value: User.USER_ROLE.ADMIN,
          text: 'Administrator',
        },
        {
          value: User.USER_ROLE.DEVELOPER,
          text: 'Dev',
        },
      ],
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

router.post('/signup', function (req, res) {
  const { email, password, role } = req.body

  console.log(req.body)

  if (!email || !password || !role) {
    return res.status(400).json({
      message: 'Error, write areas',
    })
  }

  try {
    const user = User.getByEmail(email)

    if (user) {
      return res.status(400).json({
        message: 'Error, this user exist',
      })
    }

    const newUser = User.create({ email, password, role })

    const session = Session.create(newUser)

    Confirm.create(newUser.email)

    return res.status(200).json({
      message: 'User greate register',
      session,
    })
  } catch (err) {
    return res.status(400).json({
      message: 'Error, create user',
    })
  }
})

router.get('/recovery', function (req, res) {
  return res.render('recovery', {
    name: 'recovery',

    component: ['back-button', 'field'],

    title: 'Recovery page',

    data: {},
  })
})

router.post('/recovery', function (req, res) {
  const { email } = req.body

  console.log(email)

  if (!email) {
    return res.status(400).json({
      message: 'Error, fill in the required fields',
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message: 'User of this email dose not exist',
      })
    }

    Confirm.create(email)

    return res.status(200).json({
      message: 'Code send',
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.get('/recovery-confirm', function (req, res) {
  return res.render('recovery-confirm', {
    name: 'recovery-confirm',

    component: ['back-button', 'field', 'field-password'],

    title: 'Recovery confirm page',

    data: {},
  })
})

router.post('/recovery-confirm', function (req, res) {
  const { password, code } = req.body

  console.log(password, code)

  if (!code || !password) {
    return res.status(400).json({
      message: 'Error, fill in the required fields',
    })
  }

  try {
    const email = Confirm.getData(Number(code))

    if (!email) {
      return res.status(400).json({
        message: 'Code not reality',
      })
    }

    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message: 'User this email not reality',
      })
    }

    user.password = password

    console.log(user)

    const session = Session.create(user)

    return res.status(200).json({
      message: 'Password change',
      session,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})

router.get('/signup-confirm', function (req, res) {
  const { renew, email } = req.query

  if (renew) {
    Confirm.create(email)
  }

  return res.render('signup-confirm', {
    name: 'signup-confirm',

    component: ['back-button', 'field'],

    title: 'Signup confirm page',

    data: {},
  })
})

router.post('/signup-confirm', function (req, res) {
  const { code, token } = req.body

  if (!code || !token) {
    return res.status(400).json({
      message: 'Error, fill in the required fields',
    })
  }

  try {
    const session = Session.get(token)

    if (!session) {
      return res.status(400).json({
        message: 'Erorr, you don`t go to account',
      })
    }

    const email = Confirm.getData(code)

    if (!email) {
      return res.status(400).json({
        message: 'Code not real',
      })
    }

    if (email !== session.user.email) {
      return res.status(400).json({
        message: 'Code not active',
      })
    }

    const user = User.getByEmail(session.user.email)
    user.isConfirm = true
    session.user.isConfirm = true

    return res.status(200).json({
      message: 'You confirm your email',
      session,
    })
  } catch (err) {
    res.status(400).json({
      message: err.message,
    })
  }
})

router.get('/login', function (req, res) {
  return res.render('login', {
    name: 'login',

    component: ['back-button', 'field', 'field-password'],

    title: 'Login page',
    data: {},
  })
})

router.post('/login', function (req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: 'Error,fill in the required fields',
    })
  }

  try {
    const user = User.getByEmail(email)

    if (!user) {
      return res.status(400).json({
        message: 'Error, User not find',
      })
    }

    if (user.password !== password) {
      return res.status(400).json({
        message: 'Error, not corect password',
      })
    }

    const session = Session.create(user)

    return res.status(200).json({
      message: 'You entry',
      session,
    })
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    })
  }
})
// Підключаємо роутер до бек-енду
module.exports = router
