
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './config'
import { createUserInFirestore } from './users'

export const createAdminUser = async () => {
  try {
    console.log('Criando usuário administrador...')
    
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'gugaadm@gmail.com', 
      '123456'
    )
    
    console.log('Usuário criado no Auth:', userCredential.user.uid)
    
    // Criar documento no Firestore com role admin
    await createUserInFirestore(userCredential.user.uid, {
      email: 'gugaadm@gmail.com',
      displayName: 'Guga Admin',
      role: 'admin',
      emailVerified: true
    })
    
    console.log('Usuário administrador criado com sucesso!')
    return userCredential.user
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Usuário já existe, fazendo login para testar...')
      try {
        const loginResult = await signInWithEmailAndPassword(auth, 'gugaadm@gmail.com', '123456')
        console.log('Login do admin bem-sucedido:', loginResult.user.uid)
        return loginResult.user
      } catch (loginError) {
        console.error('Erro no login do admin:', loginError)
        throw loginError
      }
    } else {
      console.error('Erro ao criar usuário admin:', error)
      throw error
    }
  }
}
