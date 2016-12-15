# form2email

## Server Setup

 1. Upload this app to a server.
 2. Register for a [Mailgun] account (free up to 10,000 emails/month).
 3. Set your server's `MAILGUN_API_KEY` environment variable to your private Mailgun API key.
    * If this is not possible, edit the `app.js` line `const apiKey = `
 4. Run form2email using `npm start`
 5. Point a DNS record to your server, e.g. `form2email.example.com`


## Website Setup

Simply add a contact form to any site as so:

	<form action="https://form2email.example.com/john@anydomain.com" method="post">
		<textarea type="text" name="body" placeholder="Message" required></textarea>
		<input type="text" name="name" placeholder="Name" required>
		<input type="email" name="email" placeholder="Email" required>
		<input type="submit" value="SEND">
	</form>

form2email will set `"name" <email>` as the Reply-To address unless a `reply_to` form value is specified.

------------

See also [formspree]: It works very similarly to form2email, but is more complicated, better tested, and allows for arbitrary form data. You can use their server https://formspree.io without registering, but their emails are branded.

  [Mailgun]: https://mailgun.net/
  [formspree]: https://github.com/formspree/formspree
