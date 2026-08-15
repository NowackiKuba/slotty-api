import type { UserProfile } from '@users/domain/aggregates';
import type { UserProfileId } from '@users/domain/value-objects';

export interface IUserProfileRepository {
  findById(id: UserProfileId): Promise<UserProfile | null>;
  findByIdIncludingDeleted(id: UserProfileId): Promise<UserProfile | null>;
  findByUserId(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}
