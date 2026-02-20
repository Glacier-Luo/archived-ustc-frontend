import { RightCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { useContext } from 'react';
import { useSWRConfig } from 'swr';

import CopyButton from '@/app/(general)/puzzle/components/CopyButton';
import CurrencyStatus from '@/app/(general)/puzzle/components/CurrencyStatus';
import { PuzzleAction } from '@/app/(general)/puzzle/components/PuzzleAction';
import { PuzzleAnswerInput } from '@/app/(general)/puzzle/components/PuzzleAnswerInput';
import { TemplateStr } from '@/components/Template';
import { GameStatusContext } from '@/logic/contexts.ts';
import { Wish } from '@/types/wish.ts';

import styles from './PuzzleTab.module.css';

export function PuzzleBody({ puzzleData }: { puzzleData: Wish.Puzzle.PuzzleDetailData }) {
    const puzzleBody = <TemplateStr name={'puzzle-desc'}>{puzzleData.desc}</TemplateStr>;
    const { mutate } = useSWRConfig();
    const { currencies } = useContext(GameStatusContext);
    const specificCurrency = currencies.find((currency) => currency.type === 'sanity');

    return (
        <>
            <div className={styles.puzzleBody}>{puzzleBody}</div>

            {puzzleData.actions.map((action, idx) => (
                <p key={idx} className={styles.puzzleAction}>
                    <RightCircleOutlined /> <PuzzleAction puzzle={puzzleData} action={action} />
                </p>
            ))}

            {puzzleData.clipboard && <CopyButton clipboardData={puzzleData.clipboard} />}

            <br />

            {/* 方便玩家查看SAN值 */}
            {specificCurrency && (
                <>
                    {' '}
                    <CurrencyStatus currencyDetail={specificCurrency} />
                    <br />
                </>
            )}

            {/* 添加SAN值过高的提示 */}
           {specificCurrency && specificCurrency.balance > 600 && (
                <div className={styles.sanWarning}>
                    <Alert
                        type={'info'}
                        showIcon={true}
                        message={'当前SAN值较高，请注意提交导致的SAN值溢出不补回。'}
                    />
                   <br />
                </div>
            )}

            {puzzleData.status === 'passed' && (
                <>
                    <Alert
                        type={'success'}
                        showIcon={true}
                        message={
                            <>
                                你的队伍已通过此题
                                {/*{puzzleData.pass_ts && <span style={{*/}
                                {/*    fontStyle: "italic",*/}
                                {/*    color: "#838383"*/}
                                {/*}}>({format_ts(puzzleData.pass_ts)})</span>}*/}
                                {puzzleData.answer_display && (
                                    <span>，这道题的正确答案是：{puzzleData.answer_display}</span>
                                )}
                            </>
                        }
                    />
                    <br />
                </>
            )}

            <PuzzleAnswerInput
                puzzle={puzzleData}
                reload={() => {
                    mutate({
                        endpoint: 'puzzle/get_detail',
                        payload: { puzzle_key: puzzleData.key },
                    }).then();
                    mutate({
                        endpoint: 'puzzle/get_submissions',
                        payload: { puzzle_key: puzzleData.key },
                    }).then();
                }}
            />
        </>
    );
}

export function PuzzleTab({ puzzleData }: { puzzleData: Wish.Puzzle.PuzzleDetailData }) {
    return <PuzzleBody puzzleData={puzzleData} />;
}
