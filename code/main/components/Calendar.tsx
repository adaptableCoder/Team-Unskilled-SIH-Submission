import React, { useMemo } from 'react'
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native'
import { Calendar as RNCalendar } from 'react-native-calendars'

export type CalendarProps = {
  visible: boolean
  onClose: () => void
  selectedDate: string
  onSelectDate: (dateString: string) => void
  /** minDate in YYYY-MM-DD format (optional) */
  minDate?: string
  /** maxDate in YYYY-MM-DD format (optional) */
  maxDate?: string
  /** optional theme override for react-native-calendars */
  theme?: any
}

const Calendar: React.FC<CalendarProps> = ({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  theme
}) => {
  const markedDates = useMemo(
    () => ({
      ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#5A67D8' } } : {})
    }),
    [selectedDate]
  )

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <RNCalendar
            onDayPress={(day: any) => {
              onSelectDate(day.dateString)
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#000000',
              selectedDayBackgroundColor: '#5A67D8',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#5A67D8',
              dayTextColor: '#000000',
              textDisabledColor: '#d3d3d3',
              dotColor: '#5A67D8',
              selectedDotColor: '#ffffff',
              arrowColor: '#999999',
              disabledArrowColor: '#d3d3d3',
              monthTextColor: '#000000',
              indicatorColor: '#5A67D8',
              textDayFontWeight: '700',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '700',
              textDayFontSize: 18,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14,
              ...(theme || {})
            }}
            minDate={minDate}
            maxDate={maxDate}
            hideExtraDays
            firstDay={1}
          />

          <View style={styles.selectRow}>
            <TouchableOpacity onPress={onClose} style={styles.selectBtn}>
              <Text style={styles.selectText}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5
  },
  selectBtn: {
    backgroundColor: '#3E3A8C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#5A67D8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  selectText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default Calendar
