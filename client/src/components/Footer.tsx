function Footer() {
    return (
        <footer className="w-full" role="contentinfo">
            <div className="nhsuk-footer" id="nhsuk-footer">
                <div className="nhsuk-width-container">
                <h2 className="nhsuk-u-visually-hidden">Support links</h2>
                <ul className="nhsuk-footer__list">
                    <li className="nhsuk-footer__list-item"><a className="nhsuk-footer__list-item-link" href="/">Accessibility statement</a></li>
                    <li className="nhsuk-footer__list-item"><a className="nhsuk-footer__list-item-link" href="/">Contact us</a></li>
                    <li className="nhsuk-footer__list-item"><a className="nhsuk-footer__list-item-link" href="/">Cookies</a></li>
                    <li className="nhsuk-footer__list-item"><a className="nhsuk-footer__list-item-link" href="/">Privacy policy</a></li>
                    <li className="nhsuk-footer__list-item"><a className="nhsuk-footer__list-item-link" href="/">Terms and conditions</a></li>
                </ul>

                <p className="nhsuk-footer__copyright">&copy; Crown copyright</p>
                </div>
            </div>
        </footer>
    );
  }

export default Footer;