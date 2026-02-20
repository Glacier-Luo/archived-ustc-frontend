import { AimOutlined, FundOutlined, QuestionCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';

import { BuildingIcon, HintIcon, InstructionIcon, VacationIcon, BrainIcon } from '@/SvgIcons';

export default function NamedIcon({ iconName, style }: { iconName: string; style?: React.CSSProperties }) {
    switch (iconName) {
        case 'ranking':
            return <FundOutlined style={style} />;
        case 'first-blood':
            return <AimOutlined style={style} />;
        case 'building':
            return <BuildingIcon style={style} />;
        case 'instruction':
            return <InstructionIcon style={style} />;
        case 'vacation':
            return <VacationIcon style={style} />;
        case 'thunder':
            return <ThunderboltOutlined style={style} />;
        case 'hintpoint':
            return <HintIcon style={style} />;
        case 'sanity':
            return <BrainIcon style={style} />;
        default:
            return <QuestionCircleOutlined style={style} />;
    }
}
