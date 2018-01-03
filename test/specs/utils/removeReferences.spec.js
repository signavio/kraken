import { schema } from 'normalizr'

import expect from '../../expect'
import removeReferences from '../../../src/utils/removeReferences'

const commentSchema = new schema.Entity('comments')
const postSchema = new schema.Entity('posts', {
  topComment: commentSchema,
  comments: [commentSchema],
})
const postsSchema = [postSchema]

describe('removeReferences', () => {
  it('should remove from to-many references', () => {
    const entityState = {
      id: 'post-1',
      title: 'My post',
      comments: ['comment-1', 'comment-2', 'comment-3'],
    }

    const responsibleSchemas = [postSchema, postsSchema]

    const result = removeReferences(
      entityState,
      responsibleSchemas,
      commentSchema,
      ['comment-1', 'comment-2']
    )

    expect(result.comments).to.deep.equal(['comment-3'])
  })

  it('should clear to-one references', () => {
    const entityState = {
      id: 'post-1',
      title: 'My post',
      topComment: 'comment-1',
    }

    const responsibleSchemas = [postSchema, postsSchema]

    const result = removeReferences(
      entityState,
      responsibleSchemas,
      commentSchema,
      ['comment-1']
    )

    expect(result.topComment).to.be.undefined
  })
})
