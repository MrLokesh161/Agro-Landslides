import { useForm } from 'react-hook-form';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // Submit form data to backend
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: 'Email is required' })} />
      {errors.email && <p>{errors.email.message}</p>}
      <input {...register('password', { required: 'Password is required' })} type='password' />
      {errors.password && <p>{errors.password.message}</p>}
      <button type='submit'>Login</button>
    </form>
  );
};

export default LoginForm;