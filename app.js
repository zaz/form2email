// Dependiencies
const express = require('express')
const Mailgun = require('mailgun-js')
const bodyParser = require('body-parser')

// Constants
const domain = 'hyperturtle.digital'
const from_user = 'noreply'
const subject = 'Message from Contact Form'
const email_matcher = /@/

// Derived Constants
const port = process.env.PORT || 3000
const from = from_user + "@" + domain
const apiKey = process.env.MAILGUN_API_KEY
const mailgun = new Mailgun({apiKey, domain})
const app = express()
// an empty whitelist allows all valid email addresses
let ewl = process.env.EMAIL_WHITELIST
const email_whitelist = ewl && ewl.split(" ") || false

// Pre-run checks
if (!apiKey) { throw Error("no Mailgun API key") }
if (!mailgun) { throw Error("failed to initialize Mailgun") }

// Functions
const send_email = (data, callback) => {
	data["h:Reply-To"] = data.reply_to
	mailgun.messages().send(data, callback)
}

const deobfuscate_email = (email) =>
	email.replace("...", "@")

const req_to_footer_text = req =>
	"\n\n-- \n"
	+ "\n" + (req.body.name || "")
	+ "\n" + (req.body.company || "")
	+ "\n" + (req.body.email || "")
	+ "\n" + (req.body.tel || "")

const req_to_data = req => ({
	from,
	to: deobfuscate_email(req.params.email),
	subject: req.body.subject || subject,
	text: (req.body.body || "") + req_to_footer_text(req),
	reply_to: req.body.reply_to || `"${req.body.name}" <${req.body.email}>`,
	honey: req.body.hny
})

const log_data = data => {
	console.log(`## To: ${data.to}`)
	console.log(data.text)
	console.log("--------------------------------------------------------------")
}

const validate_data = data => {
	if (!data.to.match(email_matcher))
		{ throw Error("500: website owner email invalid") }
	if (!data.reply_to.match(email_matcher))
		{ throw Error("400: email invalid") }
	if (!data.text)
		{ throw Error("400: no message content") }
	if (email_whitelist && !email_whitelist.includes(data.to))
		{ throw Error("500: website owner email not whitelisted") }
	// catch bots:
	if (data.honey)
		{ throw Error("400: you were recognized as a bot") }
	if (data.reply_to.length > 99)
		{ throw Error("400: your name or email is too long") }
}

// Main function
const process_email = (req, res, next) => {
	data = req_to_data(req)
	log_data(data)
	validate_data(data)
	send_email(data, (err, body) => {
		if (err) { next(err) }
		else {
			res.render('success', data)
			console.log(body)
		}
	})
}

// Express server
app.set('view engine', 'jade')

app.use(bodyParser.urlencoded({ extended: false }))

app.post('/:email', process_email)

app.use(function (error, req, res, next) {
	let code = Number(error.message.substring(0, 3)) || 500
	res.status(code)
	if (code === 500) { console.error(error) }
	else              { console.warn(error.message) }
	res.render('error', { error })
})

app.listen(port)
