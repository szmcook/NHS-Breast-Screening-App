import  {ChangeEvent}  from "react";

interface Props {
    text: string;
    value: string;
    checked?: boolean;
    onChange?: {(e: ChangeEvent<HTMLInputElement>):void};
 }

function QuestionRadio(props:Props) {
    return (
        <div className="nhsuk-radios__item">
            <input className="nhsuk-radios__input" id={"example-"+props.value} checked={props.checked} name="example" type="radio" value={props.value} onChange={props.onChange} />
            <label className="nhsuk-label nhsuk-radios__label" htmlFor={"example-"+props.value}>
                {props.text}
            </label>
        </div>
    )
  }

export default QuestionRadio;