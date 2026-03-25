import {
  BelongsTo, Column,
  CreatedAt, DataType, Default, ForeignKey, Model, PrimaryKey, Table, UpdatedAt
} from "sequelize-typescript";
import Contact from "./Contact";
import Ticket from "./Ticket";

@Table
class Message extends Model<Message> {
  @PrimaryKey
  @Column
  id: string;

  @Default(0)
  @Column
  ack: number;

  @Default(false)
  @Column
  read: boolean;

  @Default(false)
  @Column
  fromMe: boolean;

  @Column(DataType.STRING("long"))
  body: string;

  @Column(DataType.STRING)
  textMassMessage: string;

  @Column(DataType.STRING("long"))
  dataJson: string;

  @Column(DataType.STRING)
  remoteJid: string;

  @Column(DataType.STRING)
  participant: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    const value = this.getDataValue("mediaUrl");
    if (value) {
      const backendUrl = process.env.BACKEND_URL || "http://localhost";
      const proxyPort = process.env.PROXY_PORT || "8080";
      
      // Se a URL já contém a porta, não adiciona novamente
      if (backendUrl.includes(proxyPort)) {
        return `${backendUrl}/public/${value}`;
      }
      
      return `${backendUrl}:${proxyPort}/public/${value}`;
    }
    return null;
  }

  @Column
  mediaType: string;

  @Default(false)
  @Column
  isDeleted: boolean;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: Message;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;
}

export default Message;
