import {
  ApolloClient,
  ApolloLink,
  gql,
  HttpLink,
  InMemoryCache
} from 'apollo-boost';
import { envConfig } from './config';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { decode } from 'jsonwebtoken';
import moment from 'moment';
import { Auth } from './authAgain';
import { Asset } from '../interfaces/asset';


const commands: Map<string, Client> = new Map();

export class Client {
  graph!: ApolloClient<any>;
  api!: AxiosInstance;
  token: string | undefined;
  constructor(token?: string) {
    this.token = token;

    // (async () => {
    //   const schema = await introspectSchema(apolloClient.link);
    //   const executableSchema = makeRemoteExecutableSchema({
    //     schema,
    //     link: apolloClient.link
    //   });
    //   return executableSchema;
    // })();

    this.setGraph(token);
    this.setApi(token);
  }
  setApi(token?: string) {
    const _token = this.token || token;
    this.api = axios.create({
      baseURL: envConfig.apiBaseUrl,
      timeout: 0,
      maxContentLength: Infinity,
      // @ts-ignore
      maxBodyLength: Infinity,
      headers: {
        authorization: `Bearer ${_token}`
      }
    });
  }
  setGraph(token?: string) {
    const _token = this.token || token;
    // @ts-ignore
    const httpLink = new HttpLink({
      uri: envConfig.graphqlUri,
      fetch
    });
    const authLink = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: {
          authorization: token ? `Bearer ${_token}` : ''
        }
      });

      return forward(operation);
    });
    const apolloClient = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache()
    });
    this.graph = apolloClient;

    return this;
  }
  /**
   * Check if token is authorized if not auth again
   * @param mainProcess
   */
  async checkToken(mainProcess: boolean = false): Promise<this> {
    const token = this.token;
    if (!token) throw new Error('No token provided'); // Login again
    const _token: { exp: number } | null = decode(token) as {
      exp: number;
    } | null;

    const authAgain = async () => {
      // Login and get token back set token and go ahead
      try {
        const token = await Auth.authAgain(mainProcess);
        this.token = token;

        this.setGraph(token);
        // Set axios
        this.setApi(token);
        // Hide login prompt
        Auth.hideDialog();
      } catch (error) {
        console.error(error);
      }
    };
    if (!_token) {
      await authAgain();
    } else {
      const { exp } = _token;
      const _exp = moment.unix(exp);
      console.log('Expires in: ', moment(_exp).fromNow());
      if (_exp.isBefore(moment())) {
        await authAgain();
      }
    }

    return this;
  }

  unlock(slide: string) {
    return this.graph.mutate({
      mutation: gql`
        mutation unlockSlides($slides: [String]!) {
          unlockSlides(slides: $slides)
        }
      `,
      variables: {
        slides: [slide]
      }
    });
  }
  uploadTmp(id: string, data: Buffer) {
    const formData = new FormData();
    formData.append('file', data, 'file');
    return this.api.post(`/v2/storage/tmp/${id}`, formData, {
      headers: formData.getHeaders()
    });
  }

  download(file: string) {
    const id = file
      .split('.')
      .slice(0, -1)
      .join('.');
    return this.api.get(`/v2/storage/tmp/${id}`, { responseType: 'stream' });
  }

  checkout(email: string, file: string, slide: string) {
    return this.graph.mutate({
      mutation: gql`
        mutation checkout($email: String!, $file: String!, $slide: String!) {
          checkout(email: $email, file: $file, slide: $slide) {
            count
          }
        }
      `,
      variables: {
        email,
        file,
        slide
      }
    });
  }

  block(slides: any) {
    return this.graph.mutate({
      mutation: gql`
        mutation blockSlides($slides: [String]!) {
          blockSlides(slides: $slides)
        }
      `,
      variables: {
        slides: slides.map((slide: any) => slide._id)
      }
    });
  }
  getSlides(slide: string, type: string = 'group') {
    return this.graph.query({
      query: gql`
        query getSlideGroupByType($id: ID!, $type: GetterType!) {
          getSlideGroupByType(id: $id, type: $type) {
            _id
            name
            externalId
          }
        }
      `,
      variables: {
        type,
        id: slide
      }
    });
  }

  login(credentials: any) {
    return this.graph.query({
      query: gql`
        query login($credentials: Credentials!) {
          login(credentials: $credentials) {
            iss
            token
            reloadToken
          }
        }
      `,
      variables: {
        credentials: {
          password: credentials.password,
          email: credentials.email
        }
      }
    });
  }
}
