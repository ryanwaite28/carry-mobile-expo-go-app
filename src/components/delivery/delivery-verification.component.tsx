import { SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IDelivery } from '../../interfaces/deliverme.interface';
import { StylesConstants } from '../../services/styles.constants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { PageHeaderBack } from '../../components/page-headers/page-header-back.component';



export function DeliveryVerificationsComponent(props) {
  const navigation = useNavigation<any>();
  const delivery: IDelivery = props.route.params.delivery;

  return (
    <SafeAreaView style={StylesConstants.COMMON_STYLES.safeAreaViewContainer}>
      <PageHeaderBack header="Verifications">
        <View style={StylesConstants.COMMON_STYLES.flexRowSpaceBetween}>
          {/* {
            !delivery.carrier_id && (
              <TouchableOpacity style={{ marginLeft: 25 }} onPress={onDelete}>
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="black" />
              </TouchableOpacity>
            )
          } */}
        </View>
      </PageHeaderBack>

    </SafeAreaView>
  );
}