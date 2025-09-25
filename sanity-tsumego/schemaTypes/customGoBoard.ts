import GoBoardInput from '../components/GoBoardInput'

export default {
  name: 'customGoBoard',
  title: '碁盤設定',
  type: 'object',
  fields: [
    {
      name: 'initialPlacementStones',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'solutionTree',
      type: 'text',
    },
  ],
  inputComponent: GoBoardInput,
}
