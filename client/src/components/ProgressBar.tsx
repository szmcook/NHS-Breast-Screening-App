interface ProgBarProps {
    percent: number;
}

function ProgressBar(props:ProgBarProps) {
    return (
        <div className="flex flex-row items-center justify-left py-6 w-full">
            <div className="bg-gray-400 w-10/12 h-2 rounded-full">
                <div style={(props.percent > 0 && props.percent <= 100) ? {width: props.percent+"%"} : {width: "0%"}} className="bg-highlight h-2 rounded-full"></div>
            </div>
            <div className="pl-2 text-m text-gray-600 font-semibold">{props.percent > 0 ? (props.percent > 100 ? 100:props.percent.toFixed(0)) : 0}%</div>
        </div>
    );
}

export default ProgressBar;