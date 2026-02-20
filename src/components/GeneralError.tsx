import { Button, Result } from 'antd';
import React from 'react';

export function GeneralError({
    title,
    subtitle,
    reload,
}: {
    title: string | React.ReactNode;
    subtitle: string | React.ReactNode;
    reload?: () => void;
}) {
    let extra;
    if (reload) {
        extra = [
            <Button type="primary" key="reload" onClick={reload}>
                重试
            </Button>,
            <Button key="home" onClick={() => (window.location.href = '/home')}>
                回到首页
            </Button>,
        ];
    } else {
        extra = [
            <Button key="home" onClick={() => (window.location.href = '/home')}>
                回到首页
            </Button>,
        ];
    }

    const size = 256;

    const ResultIcon = () => {
        let imgUrl = '/ustc/images/404.png';
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    margin: 'auto',
                }}
            >
                <img src={imgUrl} style={{ width: '100%', height: '100%' }} alt="" />
            </div>
        );
    };

    return (
        <>
            <Result
                status="error"
                title={title}
                subTitle={subtitle}
                extra={extra}
                icon={ResultIcon()}
                style={{
                    margin: 'auto',
                    width: 900,
                    maxWidth: '100%',
                    backgroundColor: '#fafafa',
                    borderRadius: '16px',
                }}
            />
        </>
    );
}
