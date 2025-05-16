const fs = require("fs")
const bcrypt = require("bcrypt")
const saltRounds = 10

class UsersComponent {
  constructor(statePath) {
    this.users = {}
    this.statePath = statePath
    try {
      this.users = JSON.parse(fs.readFileSync(statePath, "utf-8"))
    } catch (err) {
      console.log(err.message)
      this.serialize()
    }
  }

  serialize() {
    fs.writeFileSync(this.statePath, JSON.stringify(this.users, null, 2))
  }

  read() {
    return fs.readFileSync(this.statePath)
  }

  async create(data) {
    const email = data.email

    // Hash della password in modo asincrono
    try {
      const password = await bcrypt.hash(data.password, saltRounds)
      
      // Aggiungi l'utente alla lista
      this.users[email] = {
        email: email,
        password: password
      }

      this.serialize()  // Salva i cambiamenti
    } catch (err) {
      console.log('Errore nella creazione dell\'utente:', err.message)
    }
  }

  async login(email, password) {
    const user = this.users[email]

    if (user) {
      // Confronta la password inserita con quella criptata
      const match = await bcrypt.compare(password, user.password)
      return match
    }

    return false
  }
}

module.exports = UsersComponent
