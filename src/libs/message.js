import { Notify } from 'quasar'

export const showInfo = (message) => {
  Notify.setDefaults({
    position: 'top',
    timeout: 1000,
    color: 'green-10',
    textColor: 'white',
    actions: [{
      icon: 'ion-close',
      color: 'white'
    }]
  })
  Notify.create(message)
}

export const showWarn = (message) => {
  Notify.setDefaults({
    position: 'top',
    timeout: 1000,
    color: 'negative',
    textColor: 'white',
    actions: [{
      icon: 'ion-close',
      color: 'white'
    }]
  })
  Notify.create(message)
}
