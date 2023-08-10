import { z } from 'zod'
import { PasswordCategoryDTO } from './_shared'

export const PasswordGetAllCategoriesInputDTO = z.void()

export const PasswordGetAllCategoriesOutputDTO = z.array(PasswordCategoryDTO)