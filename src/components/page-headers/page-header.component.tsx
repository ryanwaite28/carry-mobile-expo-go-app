import { View, Text } from 'react-native';
import { StylesConstants } from '../../services/styles.constants';



export function PageHeader(props) {
  const rightStyle = props.rightStyle || StylesConstants.COMMON_STYLES.flexRow;

  return (
    <View style={StylesConstants.COMMON_STYLES.navContainer}>
      <View style={StylesConstants.COMMON_STYLES.navBar}>
        <Text style={StylesConstants.COMMON_STYLES.navText}>
          { props.header }
        </Text>

        <View>
          <View style={rightStyle}>
            {!!props.children && props.children}
          </View>
        </View>
      </View>
    </View>
  );
}