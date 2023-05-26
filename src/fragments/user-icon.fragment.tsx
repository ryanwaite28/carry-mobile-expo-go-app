import { Image } from 'react-native';
import { IDeliverMeAdmin } from '../interfaces/deliverme.interface';
import { IUser } from "../interfaces/user.interface";



export function UserIcon(user: IUser | IDeliverMeAdmin, styles?: any) {
  return (
    <Image style={styles} source={user.icon_link ? {uri: user.icon_link} : require(`../../assets/anon.png`)} />
  );
}