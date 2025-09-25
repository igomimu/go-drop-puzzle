import React, { useState, useEffect, useCallback } from 'react';
import type { ObjectInputProps } from 'sanity';
import { Stack, Text, Button, Flex, Card, Box, Radio, RadioGroup } from '@sanity/ui';
import GoBoard from '../GoBoard'; // GoBoard.tsxをインポート

interface Stone {
  _key?: string;
  color: 'B' | 'W';
  x: number;
  y: number;
  type?: 'initial' | 'solution';
}

interface TsumegoDocumentValue {
  boardSize?: number;
  stones?: Stone[];
  finalJudgment?: string;
  solutionBranches?: SolutionBranch[];
}

interface SolutionBranch {
  _key: string;
  title: string;
  stones: Stone[];
}

type Mode = 'initialPlacement' | 'solutionInput';

function GoBoardInput(props: ObjectInputProps<TsumegoDocumentValue>) {
  const { value, onChange, schemaType, path } = props;

  const currentBoardSize = value?.boardSize || 9;
  const initialStones = value?.stones || [];
  const initialFinalJudgment = value?.finalJudgment || '';
  const initialSolutionBranches = value?.solutionBranches || [];

  const [mode, setMode] = useState<Mode>('initialPlacement');
  const [stones, setStones] = useState<Stone[]>(initialStones);
  const [finalJudgment, setFinalJudgment] = useState<string>(initialFinalJudgment);
  const [selectedStoneColor, setSelectedStoneColor] = useState<'B' | 'W'>('B');
  const [solutionBranches, setSolutionBranches] = useState<SolutionBranch[]>(initialSolutionBranches);
  const [selectedBranchKey, setSelectedBranchKey] = useState<string | null>(null);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState<number>(0);

  useEffect(() => {
    onChange(
      onChange.patch({
        set: {
          ...value,
          stones: stones,
          finalJudgment: finalJudgment,
          solutionBranches: solutionBranches,
        },
      })
    );
  }, [stones, finalJudgment, solutionBranches, onChange, value]);

  const getStonesForCurrentMode = useCallback(() => {
    if (mode === 'initialPlacement') {
      return stones.filter(s => s.type === 'initial');
    } else {
      const currentBranch = solutionBranches.find(b => b._key === selectedBranchKey);
      return currentBranch ? currentBranch.stones.slice(0, currentSolutionIndex + 1) : [];
    }
  }, [mode, stones, solutionBranches, selectedBranchKey, currentSolutionIndex]);

  const handleBoardClick = useCallback((x: number, y: number, event: React.MouseEvent<HTMLDivElement>) => {
    if (mode === 'initialPlacement') {
      const existingStoneIndex = stones.findIndex(s => s.x === x && s.y === y);
      if (existingStoneIndex !== -1) {
        setStones(prev => prev.filter((_, i) => i !== existingStoneIndex));
      } else {
        setStones(prev => [...prev, { x, y, color: selectedStoneColor, type: 'initial' }]);
      }
    } else { // solutionInput mode
      const currentBranchIndex = solutionBranches.findIndex(b => b._key === selectedBranchKey);
      if (currentBranchIndex === -1) return;

      setSolutionBranches(prevBranches => {
        const newBranches = [...prevBranches];
        const currentBranch = { ...newBranches[currentBranchIndex] };
        const newStones = [...currentBranch.stones];

        const lastStone = newStones[newStones.length - 1];
        const nextColor = lastStone ? (lastStone.color === 'B' ? 'W' : 'B') : 'B';

        newStones.push({ x, y, color: nextColor, type: 'solution' });
        currentBranch.stones = newStones;
        newBranches[currentBranchIndex] = currentBranch;
        return newBranches;
      });
      setCurrentSolutionIndex(prev => prev + 1);
    }
  }, [mode, stones, selectedStoneColor, solutionBranches, selectedBranchKey]);

  const handleScroll = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (mode === 'solutionInput') {
      event.preventDefault();
      const currentBranch = solutionBranches.find(b => b._key === selectedBranchKey);
      if (!currentBranch) return;

      if (event.deltaY < 0) { // Scroll up
        setCurrentSolutionIndex(prev => Math.max(0, prev - 1));
      } else { // Scroll down
        setCurrentSolutionIndex(prev => Math.min(currentBranch.stones.length - 1, prev + 1));
      }
    }
  }, [mode, solutionBranches, selectedBranchKey]);

  const addBranch = useCallback(() => {
    const newBranch: SolutionBranch = {
      _key: Math.random().toString(36).substring(2, 11),
      title: `新しい手順 ${solutionBranches.length + 1}`,
      stones: [],
    };
    setSolutionBranches(prev => [...prev, newBranch]);
    setSelectedBranchKey(newBranch._key);
    setCurrentSolutionIndex(-1); // Reset index for new branch
  }, [solutionBranches.length]);

  const deleteBranch = useCallback((key: string) => {
    setSolutionBranches(prev => prev.filter(b => b._key !== key));
    if (selectedBranchKey === key) {
      setSelectedBranchKey(null);
      setCurrentSolutionIndex(-1);
    }
  }, [selectedBranchKey]);

  const renderFinalJudgmentOptions = () => {
    const options = [
      { value: 'correct', label: '正解' },
      { value: 'incorrect', label: '不正解' },
      { value: 'ko', label: 'コウ' },
      { value: 'seki', label: 'セキ' },
      { value: 'other', label: 'その他' },
    ];

    return (
      <Flex direction="column" gap={2}>
        {options.map(option => (
          <Radio
            key={option.value}
            id={option.value}
            value={option.value}
            checked={finalJudgment === option.value}
            onChange={(event) => setFinalJudgment(event.currentTarget.value)}
            label={option.label}
            name="finalJudgment"
          />
        ))}
      </Flex>
    );
  };

  return (
    <Stack space={4}>
      <Card padding={3} shadow={1}>
        <Text size={1} weight="semibold">モード選択</Text>
        <Flex gap={2} marginTop={2}>
          <Button
            text="初期配置モード"
            mode={mode === 'initialPlacement' ? 'default' : 'ghost'}
            onClick={() => setMode('initialPlacement')}
          />
          <Button
            text="正解手順入力モード"
            mode={mode === 'solutionInput' ? 'default' : 'ghost'}
            onClick={() => setMode('solutionInput')}
          />
        </Flex>
      </Card>

      {mode === 'initialPlacement' && (
        <Card padding={3} shadow={1}>
          <Text size={1} weight="semibold">初期配置設定</Text>
          <Flex gap={2} marginTop={2}>
            <Button
              text="黒石"
              mode={selectedStoneColor === 'B' ? 'default' : 'ghost'}
              onClick={() => setSelectedStoneColor('B')}
            />
            <Button
              text="白石"
              mode={selectedStoneColor === 'W' ? 'default' : 'ghost'}
              onClick={() => setSelectedStoneColor('W')}
            />
          </Flex>
          <Box marginTop={3} onWheel={handleScroll}>
            <GoBoard
              boardSize={currentBoardSize}
              stones={getStonesForCurrentMode()}
              onBoardClick={handleBoardClick}
            />
          </Box>
        </Card>
      )}

      {mode === 'solutionInput' && (
        <Card padding={3} shadow={1}>
          <Text size={1} weight="semibold">正解手順設定</Text>
          <Flex gap={2} marginTop={2}>
            <Button text="手順追加" onClick={addBranch} />
            {selectedBranchKey && (
              <Button
                text="手順削除"
                tone="critical"
                onClick={() => selectedBranchKey && deleteBranch(selectedBranchKey)}
              />
            )}
          </Flex>
          <Flex gap={2} marginTop={2} wrap="wrap">
            {solutionBranches.map(branch => (
              <Button
                key={branch._key}
                text={branch.title}
                mode={selectedBranchKey === branch._key ? 'default' : 'ghost'}
                onClick={() => {
                  setSelectedBranchKey(branch._key);
                  setCurrentSolutionIndex(branch.stones.length > 0 ? branch.stones.length - 1 : -1);
                }}
              />
            ))}
          </Flex>
          {selectedBranchKey && (
            <Box marginTop={3} onWheel={handleScroll}>
              {console.log("DEBUG - Rendering GoBoard in solutionInput mode with stones:", getStonesForCurrentMode())}
              <GoBoard
                boardSize={currentBoardSize}
                stones={getStonesForCurrentMode()}
                onBoardClick={handleBoardClick}
              />
              <Text size={1} muted>
                手順: {currentSolutionIndex + 1} / {solutionBranches.find(b => b._key === selectedBranchKey)?.stones.length || 0}
              </Text>
            </Box>
          )}
        </Card>
      )}

      <Card padding={3} shadow={1}>
        <Text size={1} weight="semibold">最終判断</Text>
        <Box marginTop={2}>
          {renderFinalJudgmentOptions()}
        </Box>
      </Card>
    </Stack>
  );
}

export default GoBoardInput;
