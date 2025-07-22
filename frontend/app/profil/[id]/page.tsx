import Profile from '@/components/profile/Profile';

const ProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <Profile id={id} />;
};

export default ProfilePage;
