import {defineField, defineType} from 'sanity'
import GoBoardInput from '../GoBoardInput';

export default defineType({
  name: 'tsumego',
  title: 'Tsumego',
  type: 'document',
  fields: [
    
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: {
        list: [
          {title: '15級', value: '15k'},
          {title: '14級', value: '14k'},
          {title: '13級', value: '13k'},
          {title: '12級', value: '12k'},
          {title: '11級', value: '11k'},
          {title: '10級', value: '10k'},
          {title: '9級', value: '9k'},
          {title: '8級', value: '8k'},
          {title: '7級', value: '7k'},
          {title: '6級', value: '6k'},
          {title: '5級', value: '5k'},
          {title: '4級', value: '4k'},
          {title: '3級', value: '3k'},
          {title: '2級', value: '2k'},
          {title: '1級', value: '1k'},
          {title: '初段', value: '1d'},
          {title: '二段', value: '2d'},
          {title: '三段', value: '3d'},
          {title: '四段', value: '4d'},
          {title: '五段', value: '5d'},
          {title: '六段', value: '6d'},
          {title: '七段', value: '7d'},
        ],
      },
    }),
    defineField({
      name: 'boardSize',
      title: 'Board Size',
      type: 'number',
      initialValue: 13,
    }),
    defineField({
      name: 'goban',
      title: '碁盤設定',
      type: 'object',
      fields: [
        defineField({
          name: 'boardData',
          title: '碁盤データ',
          type: 'customGoBoard',
        }),
      ],
    }),
  ],
})
