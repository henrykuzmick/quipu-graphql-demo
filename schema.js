const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema
} = graphql;

axios.defaults.headers.common['Content-Type'] = 'application/vnd.quipu.v2+json';
axios.defaults.headers.common.Accept = 'application/vnd.quipu.v2+json';
axios.defaults.headers.common.Authorization = 'Bearer 32853e893740d276b48f07457620469e8cd44710404fd6ccb9301ceaaba4c7d3';

const AttachmentType = new GraphQLObjectType({
  name: 'AttachmentType',
  fields: () => ({
    id: { type: GraphQLID },
    url: {
      type: GraphQLString,
      resolve: res => res.attributes.url
    },
    smallUrl: {
      type: GraphQLString,
      resolve: res => res.attributes.small_url
    },
    thumbnailUrl: {
      type: GraphQLString,
      resolve: res => res.attributes.thumbnail_url
    },
    filename: {
      type: GraphQLString,
      resolve: res => res.attributes.filename
    },
    bookEntry: {
      type: BookEntryType,
      resolve(res) {
        const { data } = res.relationships.book_entry;
        if (data) {
          return axios.get(`https://getquipu.com/stevestevenosn/book_entries/${data.id}`)
            .then(res => res.data.data);
        }
        return null
      }
    }
  })
});

const BookEntryType = new GraphQLObjectType({
  name: 'BookEntryType',
  fields: () => ({
    id: { type: GraphQLID },
    type: { type: GraphQLString },
    number: {
      type: GraphQLString,
      resolve: res => res.attributes.number
    },
    issueDate: {
      type: GraphQLString,
      resolve: res => res.attributes.issue_date
    },
    paidAt: {
      type: GraphQLString,
      resolve: res => res.attributes.paid_at
    },
    vatAmount: {
      type: GraphQLString,
      resolve: res => res.attributes.vat_amount
    },
    retentionAmount: {
      type: GraphQLString,
      resolve: res => res.attributes.retention_amount
    },
    totalAmount: {
      type: GraphQLString,
      resolve: res => res.attributes.total_amount
    },
    issuingName: {
      type: GraphQLString,
      resolve: res => res.attributes.issuing_name
    },
    attachments: {
      type: new GraphQLList(AttachmentType),
      resolve(res) {
        const attachments = [];
        const reqs = []
        res.relationships.attachments.data.map(a => {
          reqs.push(axios.get(`https://getquipu.com/stevestevenosn/attachments/${a.id}`));
        });
        return Promise.all(reqs).then(r => {
          r.map(at => {
            attachments.push(at.data.data);
          })
          return attachments;
        })
      }
    }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    bookEntries: {
      type: new GraphQLList(BookEntryType),
      resolve(parentValue, { id }) {
        return axios.get('https://getquipu.com/stevestevenosn/book_entries')
          .then(res => res.data.data);
      }
    },
    attachments: {
      type: new GraphQLList(AttachmentType),
      resolve(parentValue, { id }) {
        return axios.get('https://getquipu.com/stevestevenosn/attachments')
          .then(res => res.data.data);
      }
    }
  })
});

module.exports = new GraphQLSchema({
  query: RootQueryType
});
