import { cleanSubmission } from '@/utils';

export function gameStartReply(originContent) {
    let cleanContent = cleanSubmission(originContent);
    if (originContent === 'GPA4.3' || originContent === 'gpa4.3' || originContent === '4.3') {
        cleanContent = originContent;
    }

    switch (cleanContent) {
        case 'USTC':
            return {
                status: 'error',
                title: '答案错误！',
                message:
                    '你提交的答案为：' +
                    cleanContent +
                    '\n' +
                    '你会发现，这似乎与你实际提交的形式不同（如果你是根据指引提交的话），' +
                    '在进行答案比较的时候，我们会忽略英文大小写以及除了中文、英文和数字之外的其他符号，' +
                    '因此你不用担心因为格式细节导致答案错误。\n' +
                    '这是一个答案错误的示例，接下来，请输入『大学物理实验』 。',
            };

        case '大学物理实验':
            return {
                status: 'info',
                title: '里程碑！',
                message:
                    '你提交的答案为：' +
                    cleanContent +
                    '\n' +
                    '\n虽然这仍然不是最终答案，但是恭喜你触发了一个里程碑，' +
                    '"里程碑"是指在作答过程中遇到的有意义的语句。它们并非正确答案，而是一句对于下一步的指示。\n' +
                    '现在，请输入『查看传单』来正式开始游戏。' +
                    '注意，提交之后队伍将不能解散、不能离队、不能更改队名，但是如果你的队伍人数还没有达到 6 人，你仍然可以招募新队员。',
            };

        case '查看传单':
            return {
                status: 'success',
                title: '答案正确！',
                message: '这是归档模式，所以无事发生。',
            };

        case '陷入睡眠':
            return { status: 'info', title: '发现彩蛋！', message: '这里不是P&KU 3（上）！' };

        case 'GPA4.3':
        case 'gpa4.3':
            return { status: 'info', title: '发现彩蛋！', message: '科男收收味！' };

        case '4.3':
            return { status: 'info', title: '发现彩蛋！', message: '你能考出这个吗？' };

        case 'GPA':
            return { status: 'info', title: '发现彩蛋！', message: '你想考出怎样的绩点？' };

        case 'PANDORAPARADOXXX':
            return { status: 'info', title: '发现彩蛋！', message: '100.4999%' };

        case 'CIALLO':
            return { status: 'info', title: '发现彩蛋！', message: '中cia快llo～(∠・ω< )⌒☆！' };

        case '很可怕吗':
            return { status: 'info', title: '发现彩蛋！', message: '是的很可怕' };

        case '春日影':
            return { status: 'info', title: '发现彩蛋！', message: '为什么要演奏春日影？' };

        case 'MYGO':
            return { status: 'info', title: '发现彩蛋！', message: "It's MyGO!!!!!" };

        case '再见':
            return { status: 'info', title: '发现彩蛋！', message: 'US-TC全答案，再见👋' };

        case 'USTC全答案':
            return { status: 'info', title: '发现彩蛋！', message: '再见👋' };

        case 'VME50':
            return { status: 'info', title: '发现彩蛋！', message: '我是秦始皇，中间忘了，V我50。' };

        case '金矿':
            return { status: 'info', title: '发现彩蛋！', message: '炸掉第一教学楼！一教下面有金矿！' };

        case 'DORO':
            return { status: 'info', title: '发现彩蛋！', message: 'DoroDoro！' };

        case 'GRAVITY':
            return { status: 'info', title: '发现彩蛋！', message: '众所周知，g > 10 m / s²' };

        default:
            return {
                status: 'error',
                title: '答案错误！',
                message: '你提交的答案为：' + cleanContent + '\n' + '你没有得到任何信息。',
            };
    }
}
