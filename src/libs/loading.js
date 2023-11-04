import {
  Loading,
  QSpinnerPuff
} from 'quasar'

export const showLoading = () => {
  Loading.show({
    spinner: QSpinnerPuff,
    spinnerColor: 'primary',
    backgroundColor: 'accent',
    message: '加载中...',
    messageColor: 'primary'
  })
}

export const hideLoading = () => {
  Loading.hide();
}
