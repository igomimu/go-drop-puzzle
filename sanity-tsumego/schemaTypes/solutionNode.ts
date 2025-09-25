import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'solutionNode',
  title: 'Solution Node',
  type: 'object',
  fields: [
    defineField({
      name: 'color',
      title: 'Color',
      type: 'string',
      options: {
        list: ['B', 'W'],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'x',
      title: 'X Coordinate',
      type: 'number',
    }),
    defineField({
      name: 'y',
      title: 'Y Coordinate',
      type: 'number',
    }),
    defineField({
      name: 'children',
      title: 'Next Moves',
      type: 'array',
      of: [{type: 'solutionNode'}], // Recursive reference to itself
    }),
    defineField({
      name: 'judgment',
      title: 'Judgment at this point',
      type: 'string',
      options: {
        list: [
          {title: '正解', value: 'correct'},
          {title: '不正解', value: 'incorrect'},
          {title: '活き', value: 'live'},
          {title: '死', value: 'dead'},
          {title: 'コウ', value: 'ko'},
        ],
      },
    }),
  ],
  preview: {
    select: {x: 'x', y: 'y', color: 'color', judgment: 'judgment'},
    prepare(selection) {
      const {x, y, color, judgment} = selection;
      return {
        title: `${color === 'B' ? '黒' : '白'} (${x}, ${y})`,
        subtitle: judgment ? `判定: ${judgment}` : '',
      };
    },
  },
})
