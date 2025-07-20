import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight
} from 'lucide-react';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaTiktok
} from 'react-icons/fa';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gray-900 dark:bg-gray-950 text-white py-16 transition-colors duration-200 overflow-hidden">
      {/* Éléments décoratifs subtils */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 12, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -top-20 -right-20 w-64 h-64 border border-gray-700/30 rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 0.9, 1]
          }}
          transition={{
            rotate: { duration: 80, repeat: Infinity, ease: "linear" },
            scale: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }
          }}
          className="absolute -bottom-20 -left-20 w-80 h-80 border border-gray-700/20 rounded-full"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-1"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Logo size="md" variant="light" />
            </motion.div>
            <motion.p
              className="mt-4 text-gray-400 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              La plateforme moderne de gestion pour auto-écoles tunisiennes.
              Simplifiez votre quotidien avec notre solution complète.
            </motion.p>

            {/* Réseaux sociaux */}
            <motion.div
              className="mt-6 flex space-x-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[
                {
                  name: 'Facebook',
                  icon: FaFacebookF,
                  href: '#',
                  color: 'hover:bg-blue-600',
                  bgColor: 'bg-blue-600/10 hover:bg-blue-600'
                },
                {
                  name: 'Instagram',
                  icon: FaInstagram,
                  href: '#',
                  color: 'hover:bg-pink-600',
                  bgColor: 'bg-pink-600/10 hover:bg-pink-600'
                },
                {
                  name: 'LinkedIn',
                  icon: FaLinkedinIn,
                  href: '#',
                  color: 'hover:bg-blue-700',
                  bgColor: 'bg-blue-700/10 hover:bg-blue-700'
                },
                {
                  name: 'Twitter',
                  icon: FaTwitter,
                  href: '#',
                  color: 'hover:bg-blue-400',
                  bgColor: 'bg-blue-400/10 hover:bg-blue-400'
                }
              ].map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full ${social.bgColor} text-white transition-all duration-300 group`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Colonnes de liens */}
          {[
            {
              title: 'Produit',
              links: [
                { name: 'Fonctionnalités', href: '/features' },
                { name: 'Tarifs', href: '/pricing' },
                { name: 'Démo', href: '#' },
                { name: 'Support', href: '/contact' }
              ]
            },
            {
              title: 'Entreprise',
              links: [
                { name: 'À propos', href: '/about' },
                { name: 'Blog', href: '#' },
                { name: 'Carrières', href: '#' },
                { name: 'Contact', href: '/contact' }
              ]
            },
            {
              title: 'Contact',
              links: [
                { name: '+216 21 251 762', href: 'tel:+21621251762', icon: Phone },
                { name: '+216 53 876 809', href: 'tel:+21653876809', icon: Phone },
                { name: 'contact@autoecole.tn', href: 'mailto:contact@autoecole.tn', icon: Mail },
                { name: 'Tunis, Tunisie', href: '#', icon: MapPin }
              ]
            }
          ].map((column, columnIndex) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + columnIndex * 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-white">
                {column.title}
              </h3>

              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + columnIndex * 0.1 + linkIndex * 0.05 }}
                  >
                    <Link
                      to={link.href}
                      className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                      {link.icon && (
                        <motion.div
                          className="mr-3"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <link.icon className="h-4 w-4" />
                        </motion.div>
                      )}
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.name}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Ligne de séparation animée */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1 }}
          />
        </motion.div>

        {/* Copyright et liens légaux */}
        <motion.div
          className="mt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.p
            whileHover={{ scale: 1.02 }}
            className="mb-4 md:mb-0"
          >
            © 2024 Plateforme Auto-école. Tous droits réservés. Made with ❤️ in Tunisia.
          </motion.p>

          <motion.div
            className="flex space-x-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            {['Politique de confidentialité', 'Conditions d\'utilisation', 'Cookies'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                className="hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1 }}
              >
                {item}
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};
