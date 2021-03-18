interface Props {
    text: string;
    disabled?: boolean;
    onClick?: {():void};
 }

function MainButton(props:Props) {
    return <button onClick={props.onClick} disabled={props.disabled} className="nhsuk-button mx-1">{props.text}</button>;
  }

export default MainButton;