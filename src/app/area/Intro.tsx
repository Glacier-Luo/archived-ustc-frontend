import { FlagOutlined } from '@ant-design/icons';
import { Alert, Input, message } from 'antd';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NotFound from '@/app/NotFound.tsx';
import { FancySlimContainer } from '@/components/FancySlimContainer';
import { Footer } from '@/components/Footer.tsx';
import { TemplateFile } from '@/components/Template';
import { WishConfirmModal } from '@/components/WishConfirmModal';
import { ARCHIVE_MODE } from '@/constants.tsx';
import { GameInfoContext, GameStatusContext, useSuccessGameInfo } from '@/logic/contexts.ts';
import { Wish } from '@/types/wish.ts';

const TARGET_CODE: string[] = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
];

const Toy = () => {
    const [keySequence, setKeySequence] = useState<string[]>([]);
    const [done, setDone] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (done) return;
            setKeySequence((prevKeys) => {
                const newKeys = [...prevKeys, event.code].slice(-TARGET_CODE.length);
                console.log(newKeys);
                return newKeys;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [done, messageApi]);

    useEffect(() => {
        if (keySequence.join('') === TARGET_CODE.join('')) {
            messageApi.success('↑↑↓↓←→←→BA!').then();
            setDone(true);
            setKeySequence([]);
        }
    }, [keySequence, messageApi]);

    return contextHolder;
};

function IntroAnswerInput() {
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState(false);
    const [inputAnswer, setInputAnswer] = useState('');
    const wishArgs = useMemo(() => ({ content: inputAnswer }), [inputAnswer]);
    const { reloadInfo } = useContext(GameInfoContext);
    const { setNeedReloadArea } = useContext(GameStatusContext);
    const navigate = useNavigate();

    const doSubmit = () => {
        if (!inputAnswer) {
            messageApi.error({ content: '提交内容不能为空！', key: 'DO_SUBMIT', duration: 4 }).then();
            return;
        }
        if (inputAnswer.toUpperCase() === 'MYGO') {
            messageApi.success({ content: 'MyGO!!!!!', key: 'MYGO' }).then();
            navigate('/area?dst=intro&mygo=run');
            return;
        }
        setOpen(true);
    };

    return (
        <div>
            {contextHolder}
            <Toy />
            <div className="golden-input-container">
                <style>{`
                    .golden-input-container .ant-input-search {
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .golden-input-container .ant-input-search::before {
                        content: '';
                        position: absolute;
                        top: -2px;
                        left: -2px;
                        right: -2px;
                        bottom: -2px;
                        background-size: 400% 400%;
                        border-radius: 8px;
                        z-index: -1;
                        animation: goldenShimmer 2s ease-in-out infinite;
                    }
                    
                    .golden-input-container .ant-input-search .ant-input-group {
                        background: #fff;
                        border-radius: 6px;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .golden-input-container .ant-input-search .ant-input {
                        border: 2px solid #ffef00;
                        box-shadow: 0 0 10px rgba(255, 239, 0, 0.4);
                        transition: all 0.3s ease;
                    }
                    
                    .golden-input-container .ant-input-search .ant-input:focus {
                        border-color: #ffef00;
                        box-shadow: 0 0 20px rgba(255, 239, 0, 0.7);
                    }
                    
                    .golden-input-container .ant-input-search .ant-input-group-addon {
                        background: linear-gradient(135deg, #ffef00, #fff700);
                        border: 2px solid #ffef00;
                        color: #b8860b;
                        font-weight: bold;
                        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);
                    }
                    
                    .golden-input-container .ant-input-search-button.ant-btn.ant-btn-default.ant-btn-color-primary.ant-btn-variant-solid {
                        background: linear-gradient(135deg, #ffef00, #fff700, #ffef00) !important;
                        background-size: 200% 200% !important;
                        border: 2px solid #ffef00 !important;
                        color: #b8860b !important;
                        font-weight: bold !important;
                        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9) !important;
                        box-shadow: 0 4px 15px rgba(255, 239, 0, 0.5) !important;
                        animation: goldenPulse 1.5s ease-in-out infinite !important;
                        transition: all 0.3s ease !important;
                    }
                    
                    .golden-input-container .ant-input-search-button.ant-btn.ant-btn-default.ant-btn-color-primary.ant-btn-variant-solid:hover {
                        background: linear-gradient(135deg, #fff700, #ffef00, #fff700) !important;
                        transform: translateY(-2px) !important;
                        box-shadow: 0 6px 20px rgba(255, 239, 0, 0.7) !important;
                        color: #b8860b !important;
                        border-color: #ffef00 !important;
                    }
                    
                    .golden-input-container .ant-input-search-button.ant-btn.ant-btn-default.ant-btn-color-primary.ant-btn-variant-solid:active {
                        transform: translateY(0) !important;
                        box-shadow: 0 2px 10px rgba(255, 239, 0, 0.5) !important;
                        background: linear-gradient(135deg, #ffef00, #fff700, #ffef00) !important;
                        color: #b8860b !important;
                        border-color: #ffef00 !important;
                    }
                    
                    .golden-input-container .golden-button-content {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                    }
                    
                    .golden-input-container .golden-icon {
                        animation: goldenIconSpin 3s linear infinite;
                        filter: drop-shadow(0 0 4px rgba(255, 239, 0, 0.9));
                        color: #b8860b;
                    }
                    
                    .golden-input-container .golden-text {
                        background: linear-gradient(45deg, #b8860b, #ffef00, #b8860b, #ffc107);
                        background-size: 300% 300%;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        animation: goldenTextShimmer 2s ease-in-out infinite;
                        font-weight: bold;
                        text-shadow: 0 0 12px rgba(255, 239, 0, 0.6);
                    }
                    
                    @keyframes goldenShimmer {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    
                    @keyframes goldenPulse {
                        0% { 
                            background-position: 0% 50%;
                            box-shadow: 0 4px 15px rgba(255, 239, 0, 0.5);
                        }
                        50% { 
                            background-position: 100% 50%;
                            box-shadow: 0 4px 20px rgba(255, 239, 0, 0.8);
                        }
                        100% { 
                            background-position: 0% 50%;
                            box-shadow: 0 4px 15px rgba(255, 239, 0, 0.5);
                        }
                    }
                    
                    @keyframes goldenIconSpin {
                        0% { 
                            transform: rotate(0deg);
                            filter: drop-shadow(0 0 4px rgba(255, 239, 0, 0.9));
                        }
                        25% { 
                            transform: rotate(5deg);
                            filter: drop-shadow(0 0 7px rgba(255, 239, 0, 1));
                        }
                        50% { 
                            transform: rotate(0deg);
                            filter: drop-shadow(0 0 4px rgba(255, 239, 0, 0.9));
                        }
                        75% { 
                            transform: rotate(-5deg);
                            filter: drop-shadow(0 0 7px rgba(255, 239, 0, 1));
                        }
                        100% { 
                            transform: rotate(0deg);
                            filter: drop-shadow(0 0 4px rgba(255, 239, 0, 0.9));
                        }
                    }
                    
                    @keyframes goldenTextShimmer {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                `}</style>
                <Input.Search
                    size="large"
                    addonBefore={'提交答案：'}
                    placeholder={'... ...'}
                    enterButton={
                        <span className="golden-button-content">
                            <FlagOutlined className="golden-icon" />
                            <span className="golden-text">提交</span>
                        </span>
                    }
                    onChange={(e) => {
                        setInputAnswer(e.target.value);
                    }}
                    value={inputAnswer}
                    onSearch={doSubmit}
                    onPressEnter={() => {}}
                />
            </div>
            <WishConfirmModal
                wishParam={{
                    endpoint: 'game/game_start',
                    payload: wishArgs,
                }}
                open={open}
                setOpen={setOpen}
                confirmContent={'确定提交吗？'}
                onFinish={(res) => {
                    setInputAnswer('');
                    if (res.need_reload_info) {
                        reloadInfo();
                        setNeedReloadArea(true);
                    }
                }}
            />
        </div>
    );
}

function IntroBody({ areaData }: { areaData: Wish.Game.IntroArea }) {
    const info = useSuccessGameInfo();

    const themeColors = {
        '--main-color': areaData.extra.mainColor,
        '--sub-color': areaData.extra.subColor,
    } as React.CSSProperties;

    const containerBgStyles: React.CSSProperties = {
        backgroundImage: `url(${areaData.extra.areaImage})`,
        backgroundPositionX: `${areaData.extra.bgFocusPositionX}%`,
        backgroundPositionY: `${areaData.extra.bgFocusPositionY}%`,
    };

    let component;
    if (ARCHIVE_MODE) {
        component = <IntroAnswerInput />;
    } else {
        if (!info.team) component = <Alert type={'info'} showIcon={true} message={'您还不在任何队伍中，请先组队！'} />;
        else component = <IntroAnswerInput />;
    }

    return (
        <div className="relative w-full" style={themeColors}>
            <div
                className="relative w-full h-[80vh] z-0"
                style={{
                    ...containerBgStyles,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    pointerEvents: 'none',
                }}
            />
            <FancySlimContainer title={areaData.extra.areaTitle} extraClassName="relative -mt-[40vh] z-[1]">
                <FancySlimContainer.SubTitle subTitle={areaData.extra.areaSubtitle} />
                <TemplateFile name={areaData.template} />
                {component}
                {info.team?.gaming && <br />}
                {info.team?.gaming && <Alert type={'success'} showIcon={true} message={'你的队伍已开始游戏。'} />}
                <br />
            </FancySlimContainer>
            <Footer />
        </div>
    );
}

export function Intro({ areaData }: { areaData: Wish.Game.IntroArea }) {
    const info = useSuccessGameInfo();
    if (!ARCHIVE_MODE && (!info.user || (info.user.group !== 'staff' && !info.game.isPrologueUnlock)))
        return <NotFound />;
    return <IntroBody areaData={areaData} />;
}
