/**
 * Regras centralizadas de senha do CT Capixaba.
 * 
 * Usamos 6 caracteres como mínimo porque:
 * - É o padrão usado nas senhas temporárias (ex: 123123)
 * - Balanceia segurança com praticidade para o contexto do app
 * 
 * Se precisar aumentar para 8 no futuro, altere apenas aqui.
 */
export const MIN_PASSWORD_LENGTH = 6;
