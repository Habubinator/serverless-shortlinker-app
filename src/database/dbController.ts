import AWS from "aws-sdk";
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "users";

export interface ILink {
  link: string;
  oglink: string;
  stats: number;
  timeToLive: number;
  date: number;
}

export interface IUser {
  email: string;
  password: string;
  refreshToken: string;
  links?: ILink[];
}

class DatabaseController {
  async findUsers(email: string) {
    return await docClient
      .get({
        TableName: tableName,
        Key: {
          email: email,
        },
      })
      .promise();
  }

  async createUser(email: string, hashPassword: string, refreshToken: string) {
    const user: IUser = {
      email: email,
      password: hashPassword,
      refreshToken: refreshToken,
      links: [],
    };

    const params = {
      TableName: tableName,
      Item: {
        email: user.email,
        password: user.password,
        refreshToken: user.refreshToken,
        links: user.links,
      },
    };

    return await docClient.put(params).promise();
  }

  async rewokeToken(refreshToken: string, email: string) {
    let user = (await this.findUsers(email)).Item;
    user.refreshToken = refreshToken;

    const params = {
      TableName: tableName,
      Item: user,
    };
    return await docClient.put(params).promise();
  }

  async createLink(
    email: string,
    link: string,
    oglink: string,
    timeToLive: number
  ) {
    let user = (await this.findUsers(email)).Item as IUser;
    user.links.push({
      link: link,
      oglink: oglink,
      stats: 0,
      timeToLive: timeToLive,
      date: Date.now(),
    });

    const params = {
      TableName: tableName,
      Item: user,
    };
    return await docClient.put(params).promise();
  }

  async deleteLink(email: string, link: string) {
    let user = (await this.findUsers(email)).Item as IUser;
    for (let i: number = 0; i < user.links.length; i++) {
      if (user.links[i].link == link) {
        user.links.splice(i, 1);
        const params = {
          TableName: tableName,
          Item: user,
        };
        return await docClient.put(params).promise();
      }
    }
    return null;
  }

  async getUserLinks(email: string) {
    let user = (await this.findUsers(email)).Item as IUser;
    return user.links;
  }

  async getAllLinks() {
    return (await docClient.scan({ TableName: tableName }).promise()).Items;
  }
  async changeStat(email: string, link: string) {
    const user = (await this.findUsers(email)).Item;
    let searchedLink;
    for (let userLink of user.links) {
      if (userLink.link === link) {
        searchedLink = userLink;
        break;
      }
    }
    if (searchedLink && searchedLink.timeToLive != 1) {
      searchedLink.stats++;

      const params = {
        TableName: tableName,
        Item: user,
      };
      return await docClient.put(params).promise();
    } else if (searchedLink) {
      const index = user.links.findIndex((userLink) => userLink.link === link);
      if (index != -1) {
        user.links.splice(index, 1);

        const params = {
          TableName: tableName,
          Item: user,
        };
        return await docClient.put(params).promise();
      }
    }
  }
}

export default new DatabaseController();
